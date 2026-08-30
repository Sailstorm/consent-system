# --------------------------------------------------------
# One shot example
# --------------------------------------------------------

one_shot_example = """
Example:

Privacy Policy:

Privacy Policy

Sci-News.com is committed to protecting and respecting your privacy. To better inform you of our policy concerning user privacy, we have adopted the following terms. Please note that these terms are subject to change, and any such changes will be included on this page.

|||Information that Sci-News.com May Collect Online

Sci-News.com may collect and process the following data about you:

- information that you provide by filling in forms on our site, including names, e-mail and website addresses; we may also ask you for information for other purposes, for example when you report a problem with our site;

|||- if you contact us, we may keep a record of that correspondence;

|||- details of your visits to our site including, but not limited to, traffic data, location data, weblogs and other communication data.

|||Sci-News.com does not knowingly collect or solicit personal information from anyone under the age of 13. We assume that minors 13 years of age or older have received permission from their parents or guardians before using this website. Parents or guardians may contact us at privacy@sci-news.com with questions or concerns about our privacy policy.

|||Use of Cookies

Sci-News.com uses cookie technology. A cookie is a small amount of data, which often includes a unique identifier that is sent to your computer or mobile phone browser from a websites computer and is stored on your devices hard drive. A website can send its own cookie to your browser if your browsers preferences allow it, but your browser only permits a website to access the cookies it has already sent to you, not the cookies sent to you by other websites. Many websites do this whenever a user visits their website in order to track online traffic flows.

|||During the course of any visit to the Sci-News.com website, the pages you see, along with a cookie, are downloaded to your device. A website does this because cookies enable a publisher to find out whether the device has visited the website before. This is done on a repeat visit by checking to see, and finding, the cookie left there on the last visit.

|||Please note that during or after your visits to the Sci-News.com website you may notice some cookies that are not related to it. Sci-News.com does not control the dissemination of these cookies. You must check the third party websites for more information about these.

|||You may refuse to accept cookies by activating the setting on your browser which allows you to refuse the setting of cookies. However, if you select this setting you may be unable to access certain parts of the site.

|||Disclosure of Your Information

Sci-News.com does not sell, trade or rent your personal information to third parties. If we choose to do so in the future, you will be notified by email of our intentions, and have the right to be removed prior to the disclosure.

|||Your Consent and Rights

By using Sci-News.com, you consent to the collection and use, in accordance with this policy, of the information you provide to us.

|||We will remove you and your personally identifiable information from our records on request if you contact us with your request at privacy@sci-news.com.

|||Contact Us

If you have any inquiries about this Privacy Policy or its implementation, you may contact us at privacy@sci-news.com.


Expected Output:
{
  "extractions": {
    "data_collection": [
      {
        "data_types": [
          "contact_information",
          "location",
          "online_activity",
          "cookies_and_tracking"
        ],
        "collection_modes": [
          "explicit",
          "implicit"
        ]
      }
    ],
    "purpose_of_use": [
      {
        "purposes": [
          "provide_site_features",
          "analytics"
        ]
      }
    ],
    "data_sharing": [
      {
        "data_types": ["cookies_and_tracking"],
        "third_party_entities": ["unnamed_third_party"],
        "does_or_does_not": "does"
      },
      {
        "data_types": ["personal_information"],
        "third_party_entities": ["unnamed_third_party"],
        "does_or_does_not": "does_not"
      }
    ],
    "data_retention": [
      {
        "data_types": ["correspondence"],
        "retention_period": "unspecified"
      }
    ],
    "user_control": [
      {
        "control_types": [
          "browser_cookie_controls",
          "personal_information_removal_request"
        ]
      }
    ]
  },
  "summaries": {
    "data_collection": "Sci-News.com collects contact details users provide and automatically collects location, browsing, communication and cookie data.",
    "purpose_of_use": "The information is used to provide site features and analyse website traffic and repeat visits.",
    "data_sharing": "Third-party cookies may track visits, but Sci-News.com states that it does not currently sell, trade or rent users’ personal information to third parties.",
    "data_retention": "Sci-News.com may retain records of user correspondence, but it does not specify how long those records are kept.",
    "user_control": "Users can block cookies in their browser and request removal of their personal information by contacting Sci-News.com."
  }
}
"""


# --------------------------------------------------------
# prompt
# --------------------------------------------------------

def build_prompt(policy_text):

    prompt = f"""
You are a privacy consent assistant.

Your task is to analyse the provided privacy policy and produce
structured privacy-practice extractions and user-friendly summaries.

Analyse the policy for the following five categories:

1. Data Collection
   - What personal data is collected and how it is collected.

2. Purpose of Use
   - Why the collected data is used.

3. Data Sharing
   - Whether personal data is shared with third parties and,
     if stated, with whom.

4. Data Retention
   - What data is retained and how long it is retained.

5. User Control
   - What choices, controls, access, deletion, or opt-out rights
     are available to users.

IMPORTANT RULES:

- Use only information explicitly supported by the policy text.
- Do not infer, assume, or invent information that is not stated
  or clearly supported by the policy.
- For the "extractions" section, follow the taxonomy, field names,
  and label style demonstrated in the example.
- Do not invent new extraction field names.
- If the policy does not provide information for a category,
  return [] for that extraction category.
- If the policy does not provide information for a summary category,
  return "Not specified in the policy."
- Keep each summary concise, clear, and understandable to a
  non-expert user.

Here is one annotated example:

{one_shot_example}

IMPORTANT:
The example above demonstrates the expected extraction taxonomy,
output structure, and summary style.

Do NOT copy information from the example into the new answer.
Analyse only the current privacy policy below.

Current Privacy Policy:

{policy_text}

Return ONLY valid JSON using exactly this structure:

{{
  "extractions": {{
    "data_collection": [],
    "purpose_of_use": [],
    "data_sharing": [],
    "data_retention": [],
    "user_control": []
  }},
  "summaries": {{
    "data_collection": "",
    "purpose_of_use": "",
    "data_sharing": "",
    "data_retention": "",
    "user_control": ""
  }}
}}

Do not include Markdown, code fences, explanations, or any text
outside the JSON.
"""

    return prompt
