export const PRACTICE_TOPICS = [
  'Data Collection',
  'Purpose of Use',
  'Data Sharing',
  'Data Retention',
  'User Control',
]

export const practiceQuestions = [
  {
    id: 'q1',
    topic: 'Data Collection',
    scenario:
      'A weather app asks for access to your precise location even when you are not using the app.',
    options: {
      A: 'Allow',
      B: "Don't Allow",
    },
    feedback: {
      A: 'The app may continue collecting detailed location information even when you are not actively using it.',
      B: 'The app will have less access to your location, but some location-based features may be limited.',
    },
    privacyTip:
      'Check whether precise or background location is actually needed for the feature you want to use.',
    nextAction: "Review the app's location permission settings.",
  },
  {
    id: 'q2',
    topic: 'Data Collection',
    scenario:
      'A shopping app asks for access to your phone contacts to help you find friends.',
    options: {
      A: 'Allow Access',
      B: "Don't Allow",
    },
    feedback: {
      A: 'The app may be able to access information about people stored in your contacts.',
      B: 'Your contact list remains private, although friend-finding features may be limited.',
    },
    privacyTip:
      "Consider whether sharing other people's contact details is necessary for the service.",
    nextAction: 'Check app permissions before enabling contact access.',
  },
  {
    id: 'q3',
    topic: 'Data Collection',
    scenario:
      'A fitness app asks to collect your heart rate and daily activity data.',
    options: {
      A: 'Share Data',
      B: "Don't Share",
    },
    feedback: {
      A: 'The app may use your health and activity information to provide personalised fitness features.',
      B: 'Less health information is collected, but some personalised features may not work.',
    },
    privacyTip:
      'Health-related information can be sensitive, so check what is collected and why.',
    nextAction: 'Review which health permissions the app currently has.',
  },
  {
    id: 'q4',
    topic: 'Purpose of Use',
    scenario:
      'An online store asks to use your email for order updates and promotional messages.',
    options: {
      A: 'Accept Both Uses',
      B: 'Allow Order Updates Only',
    },
    feedback: {
      A: 'Your email can be used for both necessary order messages and promotional marketing.',
      B: 'Your email is used for the service you requested without additional marketing use.',
    },
    privacyTip:
      'Different purposes for the same information do not always need to be accepted together.',
    nextAction: 'Look for separate marketing preferences.',
  },
  {
    id: 'q5',
    topic: 'Purpose of Use',
    scenario:
      'A music app wants to use your listening history to personalise recommendations.',
    options: {
      A: 'Allow Personalisation',
      B: "Don't Allow",
    },
    feedback: {
      A: 'Your listening history can be analysed to provide recommendations that match your interests.',
      B: 'Less behavioural information is used for personalisation, although recommendations may be less tailored.',
    },
    privacyTip:
      'Check whether personalisation is optional or necessary for the main service.',
    nextAction: 'Review personalisation settings.',
  },
  {
    id: 'q6',
    topic: 'Purpose of Use',
    scenario:
      'A free app wants to use your activity data for personalised advertising.',
    options: {
      A: 'Accept',
      B: 'Decline',
    },
    feedback: {
      A: 'Your activity may be analysed to provide advertisements based on your behaviour or interests.',
      B: 'Your activity is less likely to be used for personalised advertising, although you may still see general ads.',
    },
    privacyTip:
      'Advertising is usually different from the core function of an app.',
    nextAction: 'Check advertising and privacy preferences.',
  },
  {
    id: 'q7',
    topic: 'Data Sharing',
    scenario:
      'A shopping website wants to share your browsing activity with advertising partners.',
    options: {
      A: 'Allow Sharing',
      B: "Don't Allow",
    },
    feedback: {
      A: 'Advertising partners may receive information about your browsing activity.',
      B: 'Your browsing activity is less likely to be shared with advertising partners.',
    },
    privacyTip: 'Check who receives your information and why they need it.',
    nextAction: 'Review third-party sharing settings.',
  },
  {
    id: 'q8',
    topic: 'Data Sharing',
    scenario:
      'A delivery app says it may share your contact details with third-party delivery providers.',
    options: {
      A: 'Allow',
      B: "Don't Allow",
    },
    feedback: {
      A: 'Sharing some contact information may help the delivery provider complete your order.',
      B: 'Less information is shared, but this may affect delivery if the provider needs contact details.',
    },
    privacyTip:
      'Some data sharing supports the service, but the amount shared should still be appropriate.',
    nextAction: 'Check exactly what information is shared with delivery providers.',
  },
  {
    id: 'q9',
    topic: 'Data Sharing',
    scenario:
      'A social media app asks permission to share usage data with analytics companies.',
    options: {
      A: 'Allow Sharing',
      B: 'Decline',
    },
    feedback: {
      A: 'Analytics companies may receive information about how you use the app.',
      B: 'Less usage information is shared with external analytics providers.',
    },
    privacyTip:
      'Third-party analytics may not always be necessary for you to use the main service.',
    nextAction: 'Check analytics or tracking preferences.',
  },
  {
    id: 'q10',
    topic: 'Data Retention',
    scenario:
      'A photo editing service says it may keep uploaded photos after you delete your account.',
    options: {
      A: 'Continue Using Service',
      B: "Reconsider / Don't Continue",
    },
    feedback: {
      A: 'Your photos may remain stored for some time even after you stop using the service.',
      B: 'You avoid uploading new photos until you understand how long they may be stored.',
    },
    privacyTip:
      'Deleting an account does not always mean all information is deleted immediately.',
    nextAction: "Check the service's retention and deletion information.",
  },
  {
    id: 'q11',
    topic: 'Data Retention',
    scenario:
      'A shopping website says it will keep purchase history for several years.',
    options: {
      A: 'Accept',
      B: 'Review Before Accepting',
    },
    feedback: {
      A: 'The organisation may keep records of your purchases for the stated retention period.',
      B: 'You can understand why the information is kept before deciding whether to continue.',
    },
    privacyTip:
      'Look for both the retention period and the reason the organisation keeps the data.',
    nextAction: 'Review the retention section of the privacy information.',
  },
  {
    id: 'q12',
    topic: 'Data Retention',
    scenario:
      "An app says it keeps account information for 'as long as necessary' without giving more detail.",
    options: {
      A: 'Continue',
      B: 'Look for More Information',
    },
    feedback: {
      A: 'You accept the service even though the exact retention period is unclear.',
      B: 'You try to understand how the organisation decides when your information is deleted.',
    },
    privacyTip:
      'Retention information should help you understand how long your data may remain stored.',
    nextAction: 'Look for more detailed retention or deletion information.',
  },
  {
    id: 'q13',
    topic: 'User Control',
    scenario:
      'A social media app allows you to turn off personalised advertising in Settings.',
    options: {
      A: 'Keep Personalisation On',
      B: 'Turn It Off',
    },
    feedback: {
      A: 'The app may continue using information about your activity to personalise advertising.',
      B: 'Your activity may be used less for personalised advertising.',
    },
    privacyTip:
      'Privacy choices can often be changed after the first consent screen.',
    nextAction: 'Review privacy settings regularly.',
  },
  {
    id: 'q14',
    topic: 'User Control',
    scenario:
      'A service gives you an option to request deletion of your account data.',
    options: {
      A: 'Keep My Data',
      B: 'Request Deletion',
    },
    feedback: {
      A: 'The service can continue storing your account information according to its policy.',
      B: 'You exercise a control offered by the service to request removal of your information.',
    },
    privacyTip:
      'Check what access, correction and deletion controls are available to you.',
    nextAction: 'Review the account privacy controls.',
  },
  {
    id: 'q15',
    topic: 'User Control',
    scenario:
      'A fitness app lets you change location permissions after registration.',
    options: {
      A: 'Keep Location Access',
      B: 'Change Permission',
    },
    feedback: {
      A: 'The app can continue using your location according to the permission you previously selected.',
      B: "You reduce or remove the app's access to your location.",
    },
    privacyTip:
      'Consent and permissions do not have to remain unchanged forever.',
    nextAction: 'Review device permissions when your preferences change.',
  },
]
