"use client";
import { useRef, useState } from "react";

interface AudioRecorderProps {
  apiUrl: string;
  language: string;
  senderId: string;
  recipientId: string;
  chatRoomId: string;
}

export default function AudioRecorder({
  apiUrl, 
  language, 
  senderId, 
  recipientId, 
  chatRoomId 
}: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>('audio/webm');

  const startRecording = async () => {
    try {
      setRecording(true);
      audioChunks.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100
        }
      });
      
      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav'
      ];
      
      let mimeType = 'audio/webm'; 
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      mimeTypeRef.current = mimeType;
      
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType,
        bitsPerSecond: 128000 // 128 kbps
      });
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => handleStop();
      mediaRecorder.onerror = (e) => {
        console.error("MediaRecorder error:", e.error);
        setRecording(false);
      };
      
      mediaRecorder.start(1000); // Collect data every second
    } catch (error) {
      console.error("Recording error:", error);
      setRecording(false);
    }
  };

  const stopRecording = () => {
    setRecording(false);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleStop = async () => {
    try {
      setLoading(true);
      
      if (!audioChunks.current || audioChunks.current.length === 0) {
        throw new Error("No audio data recorded");
      }

      // Create audio blob from recorded chunks
      const audioBlob = new Blob(audioChunks.current, { 
        type: mimeTypeRef.current 
      });
      
      console.log("Audio recording details:", {
        mimeType: mimeTypeRef.current,
        size: audioBlob.size,
        chunks: audioChunks.current.length
      });
      
      // Prepare form data for API request
      const formData = new FormData();
      formData.append("audio", audioBlob, `input.${getFileExtension(mimeTypeRef.current)}`);
      formData.append("preferred_language", language);
      
      console.log("Sending audio to API:", apiUrl);
      
      let transcript = "";
      let translatedText = "";
      let finalAudioBlob = audioBlob; // Default to original recording
      
      // Process audio with the translation API
      const res = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Voice API error: ${res.status}`, errorText);
        throw new Error(`Voice API error: ${res.status} ${errorText}`);
      }

      const data = await res.json();
      console.log("API response received:", {
        hasTranscript: !!data.transcript,
        hasTranslatedText: !!data.translated_text,
        hasAudioBytes: !!data.output_audio_bytes,
        audioByteType: typeof data.output_audio_bytes
      });
      
      if (data.error) {
        console.error("API returned error:", data.error);
        throw new Error(data.error);
      }
      
      // Extract data from API response with fallbacks
      transcript = data.transcript || "";
      translatedText = data.translated_text || "";
      const outputAudioBytes = data.output_audio_bytes || [];
      
      // Try to use the translated audio if available
      if (outputAudioBytes) {
        try {
          // Handle array of integers (from updated backend)
          if (Array.isArray(outputAudioBytes) && outputAudioBytes.length > 0) {
            const byteArray = new Uint8Array(outputAudioBytes);
            if (byteArray.length > 100) {
              finalAudioBlob = new Blob([byteArray], { type: "audio/mpeg" });
              console.log("Using translated audio bytes (array), size:", byteArray.length);
            }
          } 
          // Handle base64 string (from legacy backend)
          else if (typeof outputAudioBytes === "string" && outputAudioBytes.length > 0) {
            const byteArray = Uint8Array.from(atob(outputAudioBytes), c => c.charCodeAt(0));
            if (byteArray.length > 1) {
              finalAudioBlob = new Blob([byteArray], { type: "audio/mpeg" });
              console.log("Using translated audio bytes (base64), size:", byteArray.length);
            }
          } else {
            console.log("No valid translated audio received, using original recording");
          }
        } catch (err) {
          console.error("Failed to process audio bytes:", err);
          console.log("Using original recording due to error");
        }
      }
      
      // Upload the final audio file
      const uploadFormData = new FormData();
      uploadFormData.append("audio", finalAudioBlob, "audio.wav");
      uploadFormData.append("senderId", senderId);
      uploadFormData.append("recipientId", recipientId);
      uploadFormData.append("chatRoomId", chatRoomId);
      uploadFormData.append("content", transcript || translatedText || "Voice message");
      
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const uploadErrorText = await uploadResponse.text();
        let uploadErrorMessage = uploadErrorText;

        try {
          const parsedError = JSON.parse(uploadErrorText);
          uploadErrorMessage = parsedError?.error || uploadErrorText;
        } catch (error) {
          console.error("Upload failed: ", uploadResponse.status, error);
        }

        throw new Error(`Upload failed: ${uploadResponse.status} - ${uploadErrorMessage}`);
      }
      
      console.log("Audio message uploaded successfully");
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error("Audio processing error:", err);
      alert(`Failed to process audio message: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  const getFileExtension = (mimeType: string): string => {
    if (mimeType.includes('webm')) return 'webm';
    if (mimeType.includes('mp4')) return 'mp4';
    if (mimeType.includes('ogg')) return 'ogg';
    if (mimeType.includes('wav')) return 'wav';
    return 'webm'; // fallback
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        {recording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="bg-red-600 text-white px-4 py-2 rounded animate-pulse"
            disabled={loading}
          >
            🛑 Stop Recording
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            🎤 Start Recording
          </button>
        )}
        
        {loading && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
}
