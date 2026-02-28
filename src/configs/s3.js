module.exports = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || '',
    bucketName: process.env.S3_BUCKET_NAME || '',
    /** IAM role ARN để assume (vd: arn:aws:iam::ACCOUNT:role/devops-role). Nếu set thì dùng assume role thay vì key trực tiếp */
    roleArn: process.env.AWS_ROLE_ARN || '',
};
