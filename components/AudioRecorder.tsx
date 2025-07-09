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
          echoCancellation: true,
          noiseSuppression: true,
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
      
      mediaRecorder.onstop = handleStop;
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
    setLoading(true);
    
    try {
      if (audioChunks.current.length === 0) {
        throw new Error("No audio data recorded");
      }

      const audioBlob = new Blob(audioChunks.current, { 
        type: mimeTypeRef.current 
      });
      
      const formData = new FormData();
      formData.append("audio", audioBlob, `input.${getFileExtension(mimeTypeRef.current)}`);
      formData.append("preferred_language", language);
      
      const res = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });
      
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Voice API error: ${res.status} ${errorText}`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      
      const { transcript, output_audio_bytes } = data;

      let finalAudioBlob = audioBlob; 
      
      if (output_audio_bytes && Array.isArray(output_audio_bytes) && output_audio_bytes.length > 0) {
        const byteArray = new Uint8Array(output_audio_bytes);
        finalAudioBlob = new Blob([byteArray], { type: "audio/wav" });
      } 
      
      // Upload the final audio file
      const uploadFormData = new FormData();
      uploadFormData.append("audio", finalAudioBlob, "audio.wav");
      uploadFormData.append("senderId", senderId);
      uploadFormData.append("receiverId", recipientId);
      uploadFormData.append("chatRoomId", chatRoomId);
      uploadFormData.append("content",transcript);
      
      
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

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error("Audio processing error:", err);
        alert(`Failed to process audio message: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

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