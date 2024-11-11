I want the page to load the data dynamically.  The data can be cached locally until midnight UTC. The URL to load is: https://a1jaotnvc8xv5m0n.public.blob.vercel-storage.com/aldershotTrainingAreaData.json

This URL is publicly available.

The JSON returned is an object, where they keys are the dates and the value is an object.

An example of the payload is:

"""
{
  "2024-11-24": {
    "isOpen": false,
    "conditions": {
      "raw": "8am to 4.30pm",
      "opensAt": "4.30pm",
      "closesAt": "8am"
    },
    "rawText": "Closed to public (8am to 4.30pm)"
  },
  ...
}
"""

Update the screen to use this data.