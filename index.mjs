import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const dbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dbClient);
const snsClient = new SNSClient({});

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const orderId = new Date().getTime().toString();
        
        // 1. Lưu vào DynamoDB
        await docClient.send(new PutCommand({
            TableName: "DonHang",
            Item: { orderId, customerName: body.name, drink: body.drink, timestamp: new Date().toISOString() }
        }));

        // 2. Gửi thông báo SNS
        await snsClient.send(new PublishCommand({
            TopicArn: "ARN_CUA_TOPIC_SNS_VUA_TAO", 
            Message: `Đơn mới: ${body.drink} cho ${body.name}`,
            Subject: "Thông báo đơn hàng"
        }));

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Đặt hàng thành công!" })
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};