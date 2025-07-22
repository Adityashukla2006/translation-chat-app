# Translation Chat App

A real-time chat application built with Next.js that enables users to communicate across language barriers with automatic translation features.

## 🌟 Features

- **Real-time Messaging**: Instant text messaging with live updates using Pusher
- **Voice Note Translation**: Voice messages are automatically translated to the recipient's preferred language
- **Multi-language Support**: Text messages in normal language, voice notes translated on-demand
- **File Sharing**: Upload and share files through AWS S3 integration
- **Secure Authentication**: JWT-based authentication with session management
- **Modern UI**: Clean and responsive design built with Next.js
- **Fast Performance**: Optimized with Next.js App Router
- **Cross-platform**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- npm, yarn, pnpm, or bun package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Adityashukla2006/translation-chat-app.git
   cd translation-chat-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Update the environment variables with your configuration:
   - Database connection string
   - Pusher credentials for real-time messaging
   - AWS S3 credentials for file uploads
   - JWT secret for authentication
   - Session password for security

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Built With

- **[Next.js 14+](https://nextjs.org/)** - React framework with App Router
- **[React](https://reactjs.org/)** - Frontend library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Pusher](https://pusher.com/)** - Real-time messaging service
- **[AWS S3](https://aws.amazon.com/s3/)** - File storage and management
- **[JWT](https://jwt.io/)** - Secure authentication tokens
- **[Geist Font](https://vercel.com/font)** - Modern typography

## 📁 Project Structure

```
translation-chat-app/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
├── lib/                   # Utility functions
├── public/               # Static assets
├── .env.local.example    # Environment variables template
└── README.md             # Project documentation
```

## 🌍 Translation Features

The app provides intelligent translation capabilities with different approaches for different message types:

- **Text Messages**: Sent and received in normal language without automatic translation
- **Voice Notes**: Automatically translated to each recipient's preferred language setting
- **Language Preferences**: Users can set their preferred language for voice message translation
- **Real-time Processing**: Voice translation happens seamlessly without interrupting the chat flow
- **Multi-format Support**: Handle both text and voice communications effectively

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL=your_database_connection_string

# Session Management
SESSION_PASSWORD=your_secure_session_password
JWT_SECRET=your_jwt_secret_key

# Pusher Configuration (Real-time messaging)
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster

# AWS S3 Configuration (File uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_s3_bucket_name
```

## 📱 Usage

1. **Start a Chat**: Enter the chat room
2. **Set Language Preference**: Choose your preferred language for voice note translations
3. **Send Text Messages**: Type and send messages in any language (no translation applied)
4. **Send Voice Notes**: Record voice messages that will be translated to recipients' preferred languages
5. **Real-time Updates**: See messages and translated voice notes appear instantly

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

This project follows standard Next.js and TypeScript conventions. The page auto-updates as you edit files in the `app/` directory.

## 📚 Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
- [Next.js GitHub Repository](https://github.com/vercel/next.js) - Feedback and contributions welcome

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository to Vercel
3. Configure environment variables
4. Deploy with one click

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Aditya Shukla**
- GitHub: [@Adityashukla2006](https://github.com/Adityashukla2006)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment platform
- Translation API providers for language services

---

⭐ Star this repository if you found it helpful!
