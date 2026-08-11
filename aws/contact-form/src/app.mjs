import {
  SESv2Client,
  SendEmailCommand
} from "@aws-sdk/client-sesv2";

const ses = new SESv2Client({});

const allowedOrigins = new Set([
  "https://optisoftware.com",
  "https://www.optisoftware.com"
]);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function response(statusCode, body, origin = "") {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  };

  if (allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }

  return {
    statusCode,
    headers,
    body: JSON.stringify(body)
  };
}

function normalize(value, maximumLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maximumLength);
}

export const handler = async (event) => {
  const origin = event.headers?.origin ?? event.headers?.Origin ?? "";

  if (!allowedOrigins.has(origin)) {
    return response(
      403,
      { message: "Origin not allowed." }
    );
  }

  let request;

  try {
    request = JSON.parse(event.body ?? "{}");
  } catch {
    return response(
      400,
      { message: "Invalid JSON request." },
      origin
    );
  }

  const name = normalize(request.name, 100);
  const email = normalize(request.email, 254);
  const findUs = normalize(request.findUs, 100);
  const message = normalize(request.message, 5000);

  // Honeypot field. Real users should leave this blank.
  const website = normalize(request.website, 200);

  if (website) {
    // Return success so bots do not learn they were blocked.
    return response(
      200,
      { message: "Your message was received." },
      origin
    );
  }

  if (!name || !email || !message) {
    return response(
      400,
      { message: "Name, email, and message are required." },
      origin
    );
  }

  if (!emailPattern.test(email)) {
    return response(
      400,
      { message: "Please enter a valid email address." },
      origin
    );
  }

  const emailBody = [
    "New OptiSoftware Website Inquiry",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `How they found us: ${findUs || "Not provided"}`,
    "",
    "Message:",
    "--------------------------------------------------",
    message
  ].join("\n");

  try {
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: process.env.FROM_EMAIL,
        Destination: {
          ToAddresses: [process.env.TO_EMAIL]
        },
        ReplyToAddresses: [email],
        Content: {
          Simple: {
            Subject: {
              Data: `Website inquiry from ${name}`,
              Charset: "UTF-8"
            },
            Body: {
              Text: {
                Data: emailBody,
                Charset: "UTF-8"
              }
            }
          }
        }
      })
    );

    return response(
      200,
      {
        message:
          "Thank you. Your message has been sent successfully."
      },
      origin
    );

  } catch (error) {
    console.error("SES send failed", {
      name: error?.name,
      message: error?.message
    });

    return response(
      500,
      {
        message:
          "We could not send your message. Please try again later."
      },
      origin
    );
  }
};