# OptiSoftware Contact Form — Agent Instructions

## Scope

These instructions apply specifically to the AWS contact-form application
under:

aws/contact-form/

Also follow the repository-level `AGENTS.md`.

If these instructions are more restrictive than the repository-level
instructions for contact-form work, follow these instructions.


## Architecture

The production contact form uses:

Browser
→ Amazon API Gateway HTTP API
→ AWS Lambda
→ Amazon SES

Infrastructure is managed with AWS SAM.

Preserve this architecture unless explicitly instructed otherwise.

Do not introduce:

- EC2
- Application Load Balancers
- API servers
- Express
- Containers
- Databases
- Third-party email services

for the contact form unless explicitly requested.


## Source of Truth

Authoritative Lambda source:

src/app.mjs

Lambda package definition:

src/package.json

AWS SAM infrastructure:

template.yaml

SAM deployment configuration:

samconfig.toml

Deployment helper:

deploy.sh

Do NOT treat anything under:

.aws-sam/

as source code.

`.aws-sam/` contains generated build artifacts and must remain ignored
by Git.

Never edit:

.aws-sam/build/ContactFunction/app.mjs

instead of:

src/app.mjs


## Contact Form API Contract

The website sends a JSON POST request containing:

- name
- email
- findUs
- message
- website

`website` is the hidden honeypot field.

Preserve this API contract unless both frontend and backend are being
intentionally changed together.

Do not reintroduce:

- HTML form POST navigation
- GET submissions
- Newsletter functionality
- Unsubscribe functionality
- Legacy EC2 endpoints


## Input Handling

Preserve:

- JSON request parsing
- Input normalization
- Maximum input lengths
- Required-field validation
- Email validation
- Honeypot validation
- Controlled error responses

Do not trust browser-side validation as the only validation layer.

Do not include unnecessary user-supplied content in logs.


## Honeypot Behavior

The `website` field is intentionally hidden from legitimate users.

If `website` contains a value, treat the request as likely automated spam.

Preserve the current behavior of returning a normal-looking success
response rather than revealing to the sender that the honeypot was
triggered.

Do not expose anti-spam implementation details through API responses.


## Email Behavior

Amazon SES is the approved email-delivery service.

The contact form is intended for low-volume transactional messages sent
from website visitors to OptiSoftware.

Preserve:

- Verified OptiSoftware sending identity
- SES-based delivery
- Visitor email address as Reply-To when currently configured
- OptiSoftware-controlled From address

Do NOT use the visitor's arbitrary email address as the SES From identity.

Do not add:

- Marketing campaigns
- Mailing lists
- Newsletter subscriptions
- Bulk email
- Automated promotional email

without explicit instruction.


## SES Production Environment

Amazon SES production access has been approved for the OptiSoftware
production AWS account in us-east-1.

Do not make changes to:

- SES production access
- Sending quotas
- Verified domain identity
- DKIM configuration
- Suppression configuration

unless explicitly requested.


## CORS and Origin Security

Browser access is intentionally restricted to trusted OptiSoftware
origins.

Production origins include:

- https://optisoftware.com
- https://www.optisoftware.com

Development may require:

- https://dev.optisoftware.com

Before changing CORS:

1. Inspect `src/app.mjs`.
2. Inspect `template.yaml`.
3. Check whether API Gateway and Lambda both enforce origin rules.
4. Keep the two configurations consistent.

Do NOT change allowed origins to:

*

simply to make development testing easier.

Use explicit trusted origins.


## HTTP Responses

Preserve JSON responses with appropriate HTTP status codes.

Typical categories include:

- 200 for accepted/successful requests
- 400 for invalid input
- 403 for prohibited origins
- 500 for unexpected server-side failures

Do not expose:

- AWS implementation details
- Stack traces
- SES internals
- IAM information
- Internal exception details

to website visitors.

User-facing errors should be concise and safe.


## AWS Region

The contact-form infrastructure currently operates in:

us-east-1

Do not move resources to another region without explicit approval.


## AWS Account Safety

Development and production are separate AWS accounts.

Do not assume the active AWS CLI profile points to the intended account.

Before proposing or executing AWS changes, verify identity when
appropriate using:

aws sts get-caller-identity --profile <profile>

Never infer an AWS account solely from the local shell directory.


## Infrastructure Changes

Before modifying `template.yaml`:

1. Inspect the current template.
2. Identify affected CloudFormation resources.
3. Determine whether the change modifies or replaces existing resources.
4. Explain potentially destructive replacements.

Prefer incremental infrastructure changes.

Do not replace working resources unnecessarily.


## IAM

Follow least privilege.

Do not broaden Lambda permissions without a specific requirement.

Do not add:

- AdministratorAccess
- Broad `*` actions
- Broad `*` resources

when narrower permissions can satisfy the requirement.

Do not modify GitHub OIDC roles or trust relationships as part of
ordinary contact-form work.


## Secrets

Never place secrets or credentials in:

- app.mjs
- template.yaml
- samconfig.toml
- deploy.sh
- GitHub workflow files
- AGENTS.md
- Git-tracked configuration

Never add:

- AWS access keys
- Secret access keys
- Session tokens
- Passwords
- Private keys

to the repository.


## Logging

Logging should help diagnose operational failures without unnecessarily
capturing visitor data.

Do not deliberately log:

- Full contact messages
- Credentials
- Tokens
- Sensitive request headers

When logging errors, prefer enough information to diagnose the AWS
operation without unnecessarily recording user-submitted content.


## Required Workflow Before Editing

Before modifying contact-form files:

1. Read the repository-level `AGENTS.md`.
2. Read this file.
3. Confirm the Git branch:

   git branch --show-current

4. Check the working tree:

   git status

5. Inspect:

   src/app.mjs
   template.yaml

6. Determine whether the requested change affects:
   - Lambda
   - API Gateway
   - SES
   - IAM
   - CORS
   - Frontend API compatibility

7. Briefly state the intended changes before editing.


## Validation

For Lambda changes, run:

node --check src/app.mjs

For SAM infrastructure changes, run:

sam validate --lint

Then build:

sam build

When appropriate, inspect the generated template/build output, but do
not edit generated files.


## Deployment Boundary

Validation and building do NOT authorize deployment.

Do not run:

sam deploy

unless explicitly requested.

Do not deploy merely because:

- `sam build` succeeds
- `sam validate` succeeds
- tests succeed

Stop after validation and report the results unless deployment was
explicitly requested.


## Production Safety

Never independently:

- Delete the CloudFormation stack
- Delete the Lambda function
- Delete the API Gateway API
- Delete the SES identity
- Change Route 53 records
- Change DKIM records
- Change IAM trust policies
- Disable SES sending
- Change production email recipients
- Weaken CORS
- Deploy to production

without explicit instruction.


## Git Rules

Do not commit generated `.aws-sam/` content.

Before finishing, check:

git status

and make sure `.aws-sam/` is not staged.

Do not commit or push unless explicitly requested.

Never push directly to `main` without explicit instruction.


## Required Workflow After Editing

After making changes:

1. Run appropriate validation.
2. Run `git diff --stat`.
3. Review `git diff`.
4. Verify `.aws-sam/` is not staged.
5. Summarize exactly what changed.
6. State what was validated.
7. State what was not tested.
8. Identify whether frontend compatibility needs testing.
9. Stop before commit, push, or deployment unless explicitly requested.


## Useful Checks

Check authoritative Lambda features:

grep -n "findUs\|website\|allowedOrigins" src/app.mjs

Check syntax:

node --check src/app.mjs

Check SAM:

sam validate --lint

Build:

sam build

Check Git:

git status
git diff --stat
git diff


## Preferred Operating Model

For contact-form work:

Inspect
→ Plan
→ Edit
→ Validate
→ Build
→ Diff
→ Report
→ Stop

Do not automatically continue to:

Deploy
→ Commit
→ Push
→ Production