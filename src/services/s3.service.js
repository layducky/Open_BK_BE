const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { fromTemporaryCredentials } = require('@aws-sdk/credential-providers');
const { fromEnv } = require('@aws-sdk/credential-providers');
const s3Config = require('../configs/s3');

let s3Client = null;

const getCredentials = () => {
    if (s3Config.roleArn) {
        return fromTemporaryCredentials({
            masterCredentials: fromEnv(),
            params: {
                RoleArn: s3Config.roleArn,
                RoleSessionName: 'opbk-s3-session',
                DurationSeconds: 3600,
            },
            clientConfig: { region: s3Config.region || 'ap-southeast-1' },
        });
    }
    if (s3Config.accessKeyId && s3Config.secretAccessKey) {
        return {
            accessKeyId: s3Config.accessKeyId,
            secretAccessKey: s3Config.secretAccessKey,
        };
    }
    return undefined;
};

const getS3Client = () => {
    if (!s3Client) {
        const credentials = getCredentials();
        s3Client = new S3Client({
            region: s3Config.region,
            credentials,
        });
    }
    return s3Client;
};

/**
 * Upload file to S3
 * @param {Buffer} buffer - File buffer
 * @param {string} key - S3 object key
 * @param {string} mimetype - MIME type
 * @returns {Promise<string>} - File URL (placeholder or actual URL)
 */
const uploadFile = async (buffer, key, mimetype) => {
    if (!s3Config.bucketName || !s3Config.region) {
        return ''; // Placeholder - fill in when S3 is configured
    }
    const client = getS3Client();
    await client.send(new PutObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
    }));
    return `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;
};

/**
 * Delete file from S3
 * @param {string} key - S3 object key
 */
const deleteFile = async (key) => {
    if (!s3Config.bucketName || !key) return;
    const client = getS3Client();
    await client.send(new DeleteObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
    }));
};

module.exports = {
    uploadFile,
    deleteFile,
};
