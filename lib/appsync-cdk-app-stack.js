"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppsyncCdkAppStack = void 0;
const cdk = require("@aws-cdk/core");
const appsync = require("@aws-cdk/aws-appsync");
const ddb = require("@aws-cdk/aws-dynamodb");
const lambda = require("@aws-cdk/aws-lambda");
// import * as sqs from 'aws-cdk-lib/aws-sqs';
class AppsyncCdkAppStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Creates the AppSync API
        const api = new appsync.GraphqlApi(this, "Api", {
            name: "cdk-notes-appsync-api",
            schema: appsync.Schema.fromAsset("graphql/schema.graphql"),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: appsync.AuthorizationType.API_KEY,
                    apiKeyConfig: {
                        expires: cdk.Expiration.after(cdk.Duration.days(365)),
                    },
                },
            },
            xrayEnabled: true,
        });
        // Prints out the AppSync GraphQL endpoint to the terminal
        new cdk.CfnOutput(this, "GraphQLAPIURL", {
            value: api.graphqlUrl,
        });
        // Prints out the AppSync GraphQL API key to the terminal
        new cdk.CfnOutput(this, "GraphQLAPIKey", {
            value: api.apiKey || "",
        });
        // Prints out the stack region to the terminal
        new cdk.CfnOutput(this, "Stack Region", {
            value: this.region,
        });
        const notesLambda = new lambda.Function(this, "AppSyncNotesHandler", {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: "main.handler",
            code: lambda.Code.fromAsset("lambda-fns"),
            memorySize: 1024,
        });
        const lambdaDs = api.addLambdaDataSource("lambdaDatasource", notesLambda);
        lambdaDs.createResolver({
            typeName: "Query",
            fieldName: "getNoteById",
        });
        lambdaDs.createResolver({
            typeName: "Query",
            fieldName: "listNotes",
        });
        lambdaDs.createResolver({
            typeName: "Mutation",
            fieldName: "createNote",
        });
        lambdaDs.createResolver({
            typeName: "Mutation",
            fieldName: "deleteNote",
        });
        lambdaDs.createResolver({
            typeName: "Mutation",
            fieldName: "updateNote",
        });
        const notesTable = new ddb.Table(this, 'CDKNotesTable', {
            billingMode: ddb.BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: 'id',
                type: ddb.AttributeType.STRING,
            },
        });
        // enable the Lambda function to access the DynamoDB table (using IAM)
        notesTable.grantFullAccess(notesLambda);
        // Create an environment variable that we will use in the function code
        notesLambda.addEnvironment('NOTES_TABLE', notesTable.tableName);
    }
}
exports.AppsyncCdkAppStack = AppsyncCdkAppStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwc3luYy1jZGstYXBwLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwc3luYy1jZGstYXBwLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFxQztBQUNyQyxnREFBZ0Q7QUFDaEQsNkNBQTZDO0FBQzdDLDhDQUE4QztBQUU5Qyw4Q0FBOEM7QUFFOUMsTUFBYSxrQkFBbUIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUMvQyxZQUFZLEtBQW9CLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQ2xFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLDBCQUEwQjtRQUMxQixNQUFNLEdBQUcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtZQUM5QyxJQUFJLEVBQUUsdUJBQXVCO1lBQzdCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQztZQUMxRCxtQkFBbUIsRUFBRTtnQkFDbkIsb0JBQW9CLEVBQUU7b0JBQ3BCLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPO29CQUNwRCxZQUFZLEVBQUU7d0JBQ1osT0FBTyxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUN0RDtpQkFDRjthQUNGO1lBQ0QsV0FBVyxFQUFFLElBQUk7U0FDbEIsQ0FBQyxDQUFDO1FBRUgsMERBQTBEO1FBQzFELElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ3ZDLEtBQUssRUFBRSxHQUFHLENBQUMsVUFBVTtTQUN0QixDQUFDLENBQUM7UUFFSCx5REFBeUQ7UUFDekQsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdkMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxNQUFNLElBQUksRUFBRTtTQUN4QixDQUFDLENBQUM7UUFFSCw4Q0FBOEM7UUFDOUMsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDdEMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNO1NBQ25CLENBQUMsQ0FBQztRQUVILE1BQU0sV0FBVyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDbkUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxPQUFPLEVBQUUsY0FBYztZQUN2QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDO1lBQ3pDLFVBQVUsRUFBRSxJQUFJO1NBQ2pCLENBQUMsQ0FBQztRQUVILE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUUxRSxRQUFRLENBQUMsY0FBYyxDQUFDO1lBQ3RCLFFBQVEsRUFBRSxPQUFPO1lBQ2pCLFNBQVMsRUFBRSxhQUFhO1NBQ3pCLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxjQUFjLENBQUM7WUFDdEIsUUFBUSxFQUFFLE9BQU87WUFDakIsU0FBUyxFQUFFLFdBQVc7U0FDdkIsQ0FBQyxDQUFDO1FBQ0gsUUFBUSxDQUFDLGNBQWMsQ0FBQztZQUN0QixRQUFRLEVBQUUsVUFBVTtZQUNwQixTQUFTLEVBQUUsWUFBWTtTQUN4QixDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsY0FBYyxDQUFDO1lBQ3RCLFFBQVEsRUFBRSxVQUFVO1lBQ3BCLFNBQVMsRUFBRSxZQUFZO1NBQ3hCLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxjQUFjLENBQUM7WUFDdEIsUUFBUSxFQUFFLFVBQVU7WUFDcEIsU0FBUyxFQUFFLFlBQVk7U0FDeEIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDdEQsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsZUFBZTtZQUM1QyxZQUFZLEVBQUU7Z0JBQ1osSUFBSSxFQUFFLElBQUk7Z0JBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTTthQUMvQjtTQUNGLENBQUMsQ0FBQztRQUNILHNFQUFzRTtRQUN0RSxVQUFVLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBRXZDLHVFQUF1RTtRQUN2RSxXQUFXLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbEUsQ0FBQztDQUNGO0FBaEZELGdEQWdGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiQGF3cy1jZGsvY29yZVwiO1xuaW1wb3J0ICogYXMgYXBwc3luYyBmcm9tIFwiQGF3cy1jZGsvYXdzLWFwcHN5bmNcIjtcbmltcG9ydCAqIGFzIGRkYiBmcm9tIFwiQGF3cy1jZGsvYXdzLWR5bmFtb2RiXCI7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSBcIkBhd3MtY2RrL2F3cy1sYW1iZGFcIjtcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG4vLyBpbXBvcnQgKiBhcyBzcXMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNxcyc7XG5cbmV4cG9ydCBjbGFzcyBBcHBzeW5jQ2RrQXBwU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gQ3JlYXRlcyB0aGUgQXBwU3luYyBBUElcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBwc3luYy5HcmFwaHFsQXBpKHRoaXMsIFwiQXBpXCIsIHtcbiAgICAgIG5hbWU6IFwiY2RrLW5vdGVzLWFwcHN5bmMtYXBpXCIsXG4gICAgICBzY2hlbWE6IGFwcHN5bmMuU2NoZW1hLmZyb21Bc3NldChcImdyYXBocWwvc2NoZW1hLmdyYXBocWxcIiksXG4gICAgICBhdXRob3JpemF0aW9uQ29uZmlnOiB7XG4gICAgICAgIGRlZmF1bHRBdXRob3JpemF0aW9uOiB7XG4gICAgICAgICAgYXV0aG9yaXphdGlvblR5cGU6IGFwcHN5bmMuQXV0aG9yaXphdGlvblR5cGUuQVBJX0tFWSxcbiAgICAgICAgICBhcGlLZXlDb25maWc6IHtcbiAgICAgICAgICAgIGV4cGlyZXM6IGNkay5FeHBpcmF0aW9uLmFmdGVyKGNkay5EdXJhdGlvbi5kYXlzKDM2NSkpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgeHJheUVuYWJsZWQ6IHRydWUsXG4gICAgfSk7XG5cbiAgICAvLyBQcmludHMgb3V0IHRoZSBBcHBTeW5jIEdyYXBoUUwgZW5kcG9pbnQgdG8gdGhlIHRlcm1pbmFsXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJHcmFwaFFMQVBJVVJMXCIsIHtcbiAgICAgIHZhbHVlOiBhcGkuZ3JhcGhxbFVybCxcbiAgICB9KTtcblxuICAgIC8vIFByaW50cyBvdXQgdGhlIEFwcFN5bmMgR3JhcGhRTCBBUEkga2V5IHRvIHRoZSB0ZXJtaW5hbFxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiR3JhcGhRTEFQSUtleVwiLCB7XG4gICAgICB2YWx1ZTogYXBpLmFwaUtleSB8fCBcIlwiLFxuICAgIH0pO1xuXG4gICAgLy8gUHJpbnRzIG91dCB0aGUgc3RhY2sgcmVnaW9uIHRvIHRoZSB0ZXJtaW5hbFxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiU3RhY2sgUmVnaW9uXCIsIHtcbiAgICAgIHZhbHVlOiB0aGlzLnJlZ2lvbixcbiAgICB9KTtcblxuICAgIGNvbnN0IG5vdGVzTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIkFwcFN5bmNOb3Rlc0hhbmRsZXJcIiwge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzEyX1gsXG4gICAgICBoYW5kbGVyOiBcIm1haW4uaGFuZGxlclwiLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KFwibGFtYmRhLWZuc1wiKSxcbiAgICAgIG1lbW9yeVNpemU6IDEwMjQsXG4gICAgfSk7XG5cbiAgICBjb25zdCBsYW1iZGFEcyA9IGFwaS5hZGRMYW1iZGFEYXRhU291cmNlKFwibGFtYmRhRGF0YXNvdXJjZVwiLCBub3Rlc0xhbWJkYSk7XG5cbiAgICBsYW1iZGFEcy5jcmVhdGVSZXNvbHZlcih7XG4gICAgICB0eXBlTmFtZTogXCJRdWVyeVwiLFxuICAgICAgZmllbGROYW1lOiBcImdldE5vdGVCeUlkXCIsXG4gICAgfSk7XG5cbiAgICBsYW1iZGFEcy5jcmVhdGVSZXNvbHZlcih7XG4gICAgICB0eXBlTmFtZTogXCJRdWVyeVwiLFxuICAgICAgZmllbGROYW1lOiBcImxpc3ROb3Rlc1wiLFxuICAgIH0pO1xuICAgIGxhbWJkYURzLmNyZWF0ZVJlc29sdmVyKHtcbiAgICAgIHR5cGVOYW1lOiBcIk11dGF0aW9uXCIsXG4gICAgICBmaWVsZE5hbWU6IFwiY3JlYXRlTm90ZVwiLFxuICAgIH0pO1xuXG4gICAgbGFtYmRhRHMuY3JlYXRlUmVzb2x2ZXIoe1xuICAgICAgdHlwZU5hbWU6IFwiTXV0YXRpb25cIixcbiAgICAgIGZpZWxkTmFtZTogXCJkZWxldGVOb3RlXCIsXG4gICAgfSk7XG5cbiAgICBsYW1iZGFEcy5jcmVhdGVSZXNvbHZlcih7XG4gICAgICB0eXBlTmFtZTogXCJNdXRhdGlvblwiLFxuICAgICAgZmllbGROYW1lOiBcInVwZGF0ZU5vdGVcIixcbiAgICB9KTtcblxuICAgIGNvbnN0IG5vdGVzVGFibGUgPSBuZXcgZGRiLlRhYmxlKHRoaXMsICdDREtOb3Rlc1RhYmxlJywge1xuICAgICAgYmlsbGluZ01vZGU6IGRkYi5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXG4gICAgICBwYXJ0aXRpb25LZXk6IHtcbiAgICAgICAgbmFtZTogJ2lkJyxcbiAgICAgICAgdHlwZTogZGRiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICAvLyBlbmFibGUgdGhlIExhbWJkYSBmdW5jdGlvbiB0byBhY2Nlc3MgdGhlIER5bmFtb0RCIHRhYmxlICh1c2luZyBJQU0pXG4gICAgbm90ZXNUYWJsZS5ncmFudEZ1bGxBY2Nlc3Mobm90ZXNMYW1iZGEpXG4gICAgXG4gICAgLy8gQ3JlYXRlIGFuIGVudmlyb25tZW50IHZhcmlhYmxlIHRoYXQgd2Ugd2lsbCB1c2UgaW4gdGhlIGZ1bmN0aW9uIGNvZGVcbiAgICBub3Rlc0xhbWJkYS5hZGRFbnZpcm9ubWVudCgnTk9URVNfVEFCTEUnLCBub3Rlc1RhYmxlLnRhYmxlTmFtZSk7XG4gIH1cbn1cbiJdfQ==