#!/bin/bash
# AWS Setup Script for Lucky Lottery App Deployment

# Color codes for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Lucky Lottery App AWS Setup ===${NC}"
echo -e "This script will help you set up AWS resources for deployment."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first:${NC}"
    echo "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if user is logged in to AWS
echo -e "\n${YELLOW}Checking AWS credentials...${NC}"
aws sts get-caller-identity > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}Not logged in to AWS. Please run 'aws configure' first.${NC}"
    exit 1
fi
echo -e "${GREEN}AWS credentials found.${NC}"

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "AWS Account ID: ${AWS_ACCOUNT_ID}"

# Ask for bucket name
echo -e "\n${YELLOW}S3 Bucket Setup${NC}"
read -p "Enter a unique S3 bucket name (lowercase, no spaces): " BUCKET_NAME
read -p "Enter AWS region for resources (e.g., us-east-1): " AWS_REGION

# Create S3 bucket
echo -e "\n${YELLOW}Creating S3 bucket: ${BUCKET_NAME}${NC}"
aws s3api create-bucket \
    --bucket ${BUCKET_NAME} \
    --region ${AWS_REGION} \
    ${AWS_REGION != "us-east-1" ? "--create-bucket-configuration LocationConstraint=${AWS_REGION}" : ""} \
    || { echo -e "${RED}Failed to create bucket.${NC}"; exit 1; }

# Enable S3 static website hosting
echo -e "\n${YELLOW}Enabling static website hosting...${NC}"
aws s3 website s3://${BUCKET_NAME} --index-document index.html --error-document index.html \
    || { echo -e "${RED}Failed to enable static website hosting.${NC}"; exit 1; }

# Set bucket policy for public read access
echo -e "\n${YELLOW}Setting bucket policy for public access...${NC}"
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
        }
    ]
}
EOF
aws s3api put-bucket-policy --bucket ${BUCKET_NAME} --policy file://bucket-policy.json \
    || { echo -e "${RED}Failed to set bucket policy.${NC}"; exit 1; }
rm bucket-policy.json

# Create CloudFront distribution
echo -e "\n${YELLOW}Creating CloudFront distribution...${NC}"
CF_RESULT=$(aws cloudfront create-distribution \
    --origin-domain-name ${BUCKET_NAME}.s3.amazonaws.com \
    --default-root-object index.html \
    --query "Distribution.Id" \
    --output text)

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create CloudFront distribution.${NC}"
    exit 1
fi

CF_DISTRIBUTION_ID=$CF_RESULT
echo -e "${GREEN}CloudFront distribution created successfully.${NC}"
echo -e "Distribution ID: ${CF_DISTRIBUTION_ID}"

# Create custom error response for SPA routing
echo -e "\n${YELLOW}Configuring error pages for SPA routing...${NC}"
aws cloudfront get-distribution-config --id ${CF_DISTRIBUTION_ID} > cf-config.json
# This part requires manual configuration due to ETag requirements
echo -e "${YELLOW}Please manually configure error pages in the CloudFront console:${NC}"
echo -e "1. Open CloudFront console and select your distribution"
echo -e "2. Go to Error Pages tab and create custom error responses"
echo -e "3. Add custom error response for 403 and 404 errors:"
echo -e "   - Response Page Path: /index.html"
echo -e "   - HTTP Response Code: 200"

# Create IAM user with required permissions
echo -e "\n${YELLOW}Creating IAM user for deployments...${NC}"
IAM_USER="lottery-app-deployer"
aws iam create-user --user-name ${IAM_USER} || echo -e "${YELLOW}User may already exist.${NC}"

# Create and attach IAM policy
echo -e "\n${YELLOW}Creating deployment policy...${NC}"
cat > deployment-policy.json << EOF
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
        "arn:aws:s3:::${BUCKET_NAME}/*",
        "arn:aws:s3:::${BUCKET_NAME}"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::${AWS_ACCOUNT_ID}:distribution/${CF_DISTRIBUTION_ID}"
    }
  ]
}
EOF

aws iam create-policy \
    --policy-name LotteryAppDeploymentPolicy \
    --policy-document file://deployment-policy.json \
    > policy-result.json || echo -e "${YELLOW}Policy may already exist.${NC}"

POLICY_ARN=$(cat policy-result.json | grep Arn | cut -d '"' -f 4 || echo "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/LotteryAppDeploymentPolicy")
aws iam attach-user-policy --user-name ${IAM_USER} --policy-arn ${POLICY_ARN} || echo -e "${YELLOW}Could not attach policy.${NC}"
rm deployment-policy.json policy-result.json

# Create access keys for the user
echo -e "\n${YELLOW}Creating access keys...${NC}"
aws iam create-access-key --user-name ${IAM_USER} > access-keys.json || echo -e "${YELLOW}Could not create access keys.${NC}"

echo -e "\n${GREEN}=== Setup Complete ===${NC}"
echo -e "\n${YELLOW}Here are the values you need for GitHub repository secrets:${NC}"
echo -e "AWS_REGION: ${AWS_REGION}"
echo -e "S3_BUCKET: ${BUCKET_NAME}"
echo -e "CLOUDFRONT_DISTRIBUTION_ID: ${CF_DISTRIBUTION_ID}"

if [ -f "access-keys.json" ]; then
    ACCESS_KEY_ID=$(cat access-keys.json | grep AccessKeyId | cut -d '"' -f 4)
    SECRET_ACCESS_KEY=$(cat access-keys.json | grep SecretAccessKey | cut -d '"' -f 4)
    
    echo -e "AWS_ACCESS_KEY_ID: ${ACCESS_KEY_ID}"
    echo -e "AWS_SECRET_ACCESS_KEY: ${SECRET_ACCESS_KEY}"
    echo -e "\n${RED}IMPORTANT: The access keys above are only shown once.${NC}"
    echo -e "${RED}Save them to your GitHub repository secrets now!${NC}"
    
    # Remove sensitive file after displaying
    rm access-keys.json
else
    echo -e "\n${YELLOW}No new access keys were created. You'll need to create them manually.${NC}"
fi

echo -e "\n${GREEN}You can now add these secrets to your GitHub repository by going to:${NC}"
echo -e "Settings → Secrets → Actions → New repository secret"