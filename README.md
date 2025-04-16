# Lucky Lottery Number Generator 🎲 ✨

A modern, interactive web application that generates "lucky" lottery numbers based on a user's name and birthday. Built with React, TypeScript, and Material UI.

## Features

- **Personal Lucky Numbers**: Generate unique lottery numbers based on your name and birthday
- **Interactive UI**: Beautiful Material UI components with custom styling
- **Engaging Animations**: Watch your lottery numbers shuffle before revealing the final results
- **Spectacular Celebration**: Enjoy an extravagant fireworks display when your numbers are revealed
- **Sound Effects**: Experience accompanying sound effects for a multi-sensory celebration
- **Responsive Design**: Works beautifully on both desktop and mobile devices
- **Dark Mode Support**: Automatic theme switching based on system preferences

## Technology Stack

- **React**: UI library for building the interactive components
- **TypeScript**: For type-safe code
- **Vite**: Fast build tool and development environment
- **Material UI v7**: Component library for beautiful, responsive design
- **CSS-in-JS**: Styled components using Material UI's styling solution
- **Web Audio API**: For generating sound effects

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/lucky-lottery-numbers.git
   cd lucky-lottery-numbers
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser to the URL shown in the terminal (typically http://localhost:5173)

## How It Works

The application uses a simple pseudo-random number generator seeded by the user's name and birthday to create a set of "lucky" lottery numbers. While the algorithm is deterministic (the same inputs will always produce the same numbers), it creates the illusion of personalized lucky numbers.

The generated numbers are displayed with colorful animations, accompanied by a spectacular fireworks show and celebratory sound effects.

## Deployment with CI/CD

This project uses GitHub Actions to automatically deploy to AWS S3 and CloudFront.

### AWS Setup Requirements

1. **Create an S3 Bucket**:
   - Sign in to AWS Console
   - Create a new S3 bucket (e.g., `lucky-lottery-app`)
   - Enable "Static website hosting" in bucket properties
   - Set the index document to `index.html`
   - Configure bucket policy to allow public access:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Principal": "*",
           "Action": "s3:GetObject",
           "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
         }
       ]
     }
     ```

2. **Set up CloudFront Distribution**:
   - Create a new CloudFront distribution
   - Set the S3 bucket as the origin
   - Configure HTTPS if needed
   - Under "Error Pages", create a custom error response:
     - HTTP Error Code: 403 (and another for 404)
     - Response Page Path: `/index.html`
     - HTTP Response Code: 200

3. **IAM User for Deployments**:
   - Create an IAM user with programmatic access
   - Attach this policy (replace with your actual values):
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": [
             "s3:PutObject",
             "s3:GetObject",
             "s3:ListBucket",
             "s3:DeleteObject"
           ],
           "Resource": [
             "arn:aws:s3:::YOUR-BUCKET-NAME/*",
             "arn:aws:s3:::YOUR-BUCKET-NAME"
           ]
         },
         {
           "Effect": "Allow",
           "Action": [
             "cloudfront:CreateInvalidation"
           ],
           "Resource": "arn:aws:cloudfront::YOUR-ACCOUNT-ID:distribution/YOUR-DISTRIBUTION-ID"
         }
       ]
     }
     ```
   - Save the Access Key ID and Secret Access Key

### GitHub Repository Setup

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

- `AWS_ACCESS_KEY_ID`: IAM user's access key
- `AWS_SECRET_ACCESS_KEY`: IAM user's secret key
- `AWS_REGION`: Region your S3 bucket is in (e.g., `us-east-1`)
- `S3_BUCKET`: S3 bucket name
- `CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID

Once set up, every push to the main branch will automatically deploy your app to AWS.

## License

MIT

## Acknowledgments

- Created with ❤️ using React and Material UI
- Fireworks animation inspired by various open-source implementations
- Sound effects generated using the Web Audio API

---

*Note: This project is for entertainment purposes only. The lottery numbers generated are not scientifically proven to increase your chances of winning any lottery.*
