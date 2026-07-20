import json
import os
import time

config = {
    "CallerReference": f"optisoftware-prod-{int(time.time())}",
    "Comment": "OptiSoftware production website",
    "Enabled": True,
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-prod-optisoftware-website",
                "DomainName": "prod-optisoftware-website-953246179631.s3.us-east-1.amazonaws.com",
                "OriginAccessControlId": os.environ["PROD_OAC_ID"],
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-prod-optisoftware-website",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        },
        "Compress": True,
        "ForwardedValues": {
            "QueryString": False,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
    },
    "PriceClass": "PriceClass_100",
    "ViewerCertificate": {
        "CloudFrontDefaultCertificate": True
    }
}

with open("prod-distribution-config.json", "w") as f:
    json.dump(config, f, indent=2)

print("Created prod-distribution-config.json")
