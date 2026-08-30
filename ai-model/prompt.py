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
  "data_collection": {
    "status": "mentioned",
    "clarity": "partially_clear",
    "extraction": [
      {
        "data_types": [
          "contact_information",
          "user_online_activities"
        ],
        "collection_mode": "explicit",
        "collection_process": "collected_on_website",
        "evidence": [
          {
            "text": "information that you provide by filling in forms on our site"
          },
          {
            "text": "names, e-mail and website addresses"
          }
        ]
      },
      {
        "data_types": [
          "location",
          "user_online_activities",
          "communication_data"
        ],
        "collection_mode": "implicit",
        "collection_process": "collected_during_site_visit",
        "evidence": [
          {
            "text": "details of your visits to our site"
          },
          {
            "text": "traffic data, location data, weblogs and other communication data"
          }
        ]
      },
      {
        "data_types": [
          "cookies_and_tracking_elements"
        ],
        "collection_mode": "implicit",
        "collection_process": "collected_on_website",
        "evidence": [
          {
            "text": "Sci-News.com uses cookie technology"
          },
          {
            "text": "the pages you see, along with a cookie, are downloaded to your device"
          }
        ]
      },
      {
        "data_types": [
          "correspondence"
        ],
        "collection_mode": "explicit",
        "collection_process": "collected_when_user_contacts_company",
        "evidence": [
          {
            "text": "if you contact us"
          },
          {
            "text": "we may keep a record of that correspondence"
          }
        ]
      }
    ],
    "summary": "Sci-News.com collects contact details and correspondence provided by users and automatically collects location, browsing, communication and cookie data.",
    "explanation": {
      "what_is_collected": "The policy mentions names, email and website addresses, correspondence, traffic and location data, weblogs, communication data and cookies.",
      "how_it_is_collected": "Some information is submitted through forms or when users contact the site, while visit details and cookies are collected automatically.",
      "when_it_is_collected": "Information is collected when users complete forms, contact the site or browse its pages.",
      "required_or_optional": "The policy does not clearly state which information is required and which information is optional.",
      "unclear_details": "The policy refers to other information and communication data without defining every specific data field."
    },
    "why_this_matters": "Users may provide some information directly, while other information is collected automatically during browsing."
  },
  "purpose_of_use": {
    "status": "mentioned",
    "clarity": "partially_clear",
    "extraction": [
      {
        "data_types": [
          "contact_information"
        ],
        "purposes": [
          "basic_service_feature"
        ],
        "actor": "first_party",
        "evidence": [
          {
            "text": "when you report a problem with our site"
          }
        ]
      },
      {
        "data_types": [
          "cookies_and_tracking_elements",
          "user_online_activities"
        ],
        "purposes": [
          "analytics_research"
        ],
        "actor": "first_party",
        "evidence": [
          {
            "text": "in order to track online traffic flows"
          },
          {
            "text": "cookies enable a publisher to find out whether the device has visited the website before"
          }
        ]
      },
      {
        "data_types": [
          "location",
          "communication_data",
          "correspondence"
        ],
        "purposes": [
          "unspecified"
        ],
        "actor": "first_party",
        "evidence": []
      }
    ],
    "summary": "Sci-News.com uses submitted information to support site interactions and uses cookies and browsing activity to analyse traffic and recognise repeat visits.",
    "explanation": {
      "stated_purposes": "The policy describes using submitted information for site interactions such as reporting problems and using cookies to analyse traffic and identify repeat visits.",
      "data_purpose_links": "Cookies and browsing activity are linked to traffic analysis, while submitted information is linked to interactions with the site.",
      "unspecified_purposes": "The policy does not clearly explain every purpose for collecting location data, communication data or correspondence.",
      "additional_uses": "The policy says information may be requested for other purposes but does not define all of those purposes."
    },
    "why_this_matters": "Some purposes are explained, but several collected data types are not linked to a clear purpose."
  },
  "data_sharing": {
    "status": "mentioned",
    "clarity": "partially_clear",
    "extraction": [
      {
        "data_types": [
          "cookies_and_tracking_elements",
          "website_visit_information"
        ],
        "third_party_entities": [
          "unnamed_third_party"
        ],
        "sharing_process": "third_party_tracking_on_first_party_website",
        "purposes": [
          "unspecified"
        ],
        "does_or_does_not": "does",
        "evidence": [
          {
            "text": "some cookies that are not related to it"
          },
          {
            "text": "You must check the third party websites for more information about these"
          }
        ]
      },
      {
        "data_types": [
          "generic_personal_information"
        ],
        "third_party_entities": [
          "unnamed_third_party"
        ],
        "sharing_process": "sell_trade_or_rent",
        "purposes": [
          "unspecified"
        ],
        "does_or_does_not": "does_not",
        "evidence": [
          {
            "text": "Sci-News.com does not sell, trade or rent your personal information to third parties"
          }
        ]
      }
    ],
    "summary": "Third-party cookies may be present during visits, but Sci-News.com states that it does not currently sell, trade or rent users' personal information to third parties.",
    "explanation": {
      "who_receives_data": "Unnamed third parties may place or control cookies encountered during visits to Sci-News.com.",
      "why_data_is_shared": "The policy does not clearly explain the purposes of the third-party cookie activity.",
      "named_organisations": "The policy does not name the third-party organisations involved.",
      "what_data_is_shared": "The policy indicates that cookies and visit-related information may be involved but does not clearly identify every data field available to third parties.",
      "user_control": "If Sci-News.com decides to sell, trade or rent personal information in the future, it says users will be notified and may ask to be removed before disclosure."
    },
    "why_this_matters": "The policy mentions third-party cookie activity but does not identify the organisations involved or clearly explain their purposes."
  },
  "data_retention": {
    "status": "mentioned",
    "clarity": "unclear",
    "extraction": [
      {
        "data_types": [
          "correspondence"
        ],
        "retention_period": "unspecified",
        "retention_purpose": "unspecified",
        "evidence": [
          {
            "text": "we may keep a record of that correspondence"
          }
        ]
      }
    ],
    "summary": "Sci-News.com may retain records of user correspondence, but the policy does not specify how long those records are kept.",
    "explanation": {
      "what_is_retained": "The site may retain a record of correspondence when a user contacts it.",
      "retention_period": "The policy does not specify how long correspondence records are retained.",
      "retention_reason": "The policy does not state a specific reason for retaining correspondence.",
      "deletion_condition": "The policy does not explain when correspondence records are automatically deleted."
    },
    "why_this_matters": "Users are told that correspondence may be retained but are not given a retention period or deletion condition."
  },
  "user_control": {
    "status": "mentioned",
    "clarity": "partially_clear",
    "extraction": [
      {
        "control_type": "browser_device_privacy_controls",
        "control_scope": "cookie_collection",
        "data_types": [
          "cookies_and_tracking_elements"
        ],
        "method": "browser_settings",
        "limitations": [
          "parts_of_site_may_be_unavailable"
        ],
        "evidence": [
          {
            "text": "You may refuse to accept cookies by activating the setting on your browser"
          },
          {
            "text": "you may be unable to access certain parts of the site"
          }
        ]
      },
      {
        "control_type": "removal_request",
        "control_scope": "personal_information",
        "data_types": [
          "generic_personal_information"
        ],
        "method": "contact_company",
        "limitations": [],
        "evidence": [
          {
            "text": "We will remove you and your personally identifiable information from our records on request"
          },
          {
            "text": "privacy@sci-news.com"
          }
        ]
      },
      {
        "control_type": "opt_out_before_future_disclosure",
        "control_scope": "third_party_disclosure",
        "data_types": [
          "generic_personal_information"
        ],
        "method": "request_removal_after_notification",
        "limitations": [],
        "evidence": [
          {
            "text": "you will be notified by email of our intentions"
          },
          {
            "text": "have the right to be removed prior to the disclosure"
          }
        ]
      },
      {
        "control_type": "consent_by_use",
        "control_scope": "collection_and_use",
        "data_types": [
          "information_provided_by_user"
        ],
        "method": "use_of_service",
        "limitations": [
          "only_option_may_be_not_to_use_service"
        ],
        "evidence": [
          {
            "text": "By using Sci-News.com, you consent to the collection and use"
          }
        ]
      }
    ],
    "summary": "Users can block cookies through browser settings, request removal of their personal information and opt out before any future third-party disclosure described by the policy.",
    "explanation": {
      "available_controls": "Users can reject cookies, request removal of personal information and ask to be excluded before a future disclosure.",
      "how_to_exercise_controls": "Cookie controls are available through browser settings, while personal-information removal requests must be sent to Sci-News.com.",
      "access_and_correction": "The policy does not clearly describe a general process for accessing or correcting stored information.",
      "deletion": "Users may request removal of their personally identifiable information by contacting privacy@sci-news.com.",
      "consent_or_opt_out": "The policy treats use of the site as consent and says users may opt out before a future disclosure of personal information.",
      "limitations": "Rejecting cookies may prevent access to some parts of the site."
    },
    "why_this_matters": "The policy provides several controls, but some require contacting the company and it does not clearly describe general access or correction rights."
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

1. Return exactly one top-level object for each of the five categories.
2. Each summary must be exactly one short sentence.
3. Each explanation field must use simple, user-friendly language.
4. Every factual claim in summary, explanation and why_this_matters must be supported by extraction.
5. Evidence must contain only exact quotations copied from the supplied policy.
6. Evidence objects must contain only the "text" field.
7. Do not output policy_id, segment_id, annotation_id or character indexes.
8. Do not infer missing information.
9. When a practice is stated but a detail is missing, use "unspecified".
10. When no relevant practice is identified:
    - set status to "not_identified";
    - set clarity to "unclear";
    - return an empty extraction array;
    - explain that the information was not identified in the supplied policy.
11. Preserve explicit negation, especially "does_not".

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
  "data_collection": {{
    "status": "mentioned | not_identified",
    "clarity": "clear | partially_clear | unclear",
    "extraction": [
      {{
        "data_types": [],
        "collection_mode": "explicit | implicit | unspecified",
        "collection_process": "",
        "evidence": [
          {{
            "text": ""
          }}
        ]
      }}
    ],
    "summary": "",
    "explanation": {{
      "what_is_collected": "",
      "how_it_is_collected": "",
      "when_it_is_collected": "",
      "required_or_optional": "",
      "unclear_details": ""
    }},
    "why_this_matters": ""
  }},

  "purpose_of_use": {{
    "status": "mentioned | not_identified",
    "clarity": "clear | partially_clear | unclear",
    "extraction": [
      {{
        "data_types": [],
        "purposes": [],
        "actor": "first_party | third_party | unspecified",
        "evidence": [
          {{
            "text": ""
          }}
        ]
      }}
    ],
    "summary": "",
    "explanation": {{
      "stated_purposes": "",
      "data_purpose_links": "",
      "unspecified_purposes": "",
      "additional_uses": ""
    }},
    "why_this_matters": ""
  }},

  "data_sharing": {{
    "status": "mentioned | not_identified",
    "clarity": "clear | partially_clear | unclear",
    "extraction": [
      {{
        "data_types": [],
        "third_party_entities": [],
        "sharing_process": "",
        "purposes": [],
        "does_or_does_not": "does | does_not | unspecified",
        "evidence": [
          {{
            "text": ""
          }}
        ]
      }}
    ],
    "summary": "",
    "explanation": {{
      "who_receives_data": "",
      "why_data_is_shared": "",
      "named_organisations": "",
      "what_data_is_shared": "",
      "user_control": ""
    }},
    "why_this_matters": ""
  }},

  "data_retention": {{
    "status": "mentioned | not_identified",
    "clarity": "clear | partially_clear | unclear",
    "extraction": [
      {{
        "data_types": [],
        "retention_period": "",
        "retention_purpose": "",
        "evidence": [
          {{
            "text": ""
          }}
        ]
      }}
    ],
    "summary": "",
    "explanation": {{
      "what_is_retained": "",
      "retention_period": "",
      "retention_reason": "",
      "deletion_condition": ""
    }},
    "why_this_matters": ""
  }},

  "user_control": {{
    "status": "mentioned | not_identified",
    "clarity": "clear | partially_clear | unclear",
    "extraction": [
      {{
        "control_type": "",
        "control_scope": "",
        "data_types": [],
        "method": "",
        "limitations": [],
        "evidence": [
          {{
            "text": ""
          }}
        ]
      }}
    ],
    "summary": "",
    "explanation": {{
      "available_controls": "",
      "how_to_exercise_controls": "",
      "access_and_correction": "",
      "deletion": "",
      "consent_or_opt_out": "",
      "limitations": ""
    }},
    "why_this_matters": ""
  }}
}}

Do not include Markdown, code fences, explanations, or any text
outside the JSON.
"""

    return prompt
