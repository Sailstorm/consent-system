// Lesson content for the five privacy topics.

export const LESSONS = [
  {
    slug: 'data-collection',
    how: {
      kind: 'sources',
      title: 'Three ways a service gets your information',
      items: [
        { icon: 'edit', label: 'You type it in', note: 'Name, email, address' },
        { icon: 'pin', label: 'Your device shares it', note: 'Location, device type' },
        { icon: 'eye', label: 'It records what you do', note: 'Pages you visit, time spent' },
      ],
      target: { icon: 'building', label: 'The company keeps it' },
    },
    icon: 'collect',
    title: 'Data collection',
    shortDescription:
      'Understand what information a service may ask you to provide.',
    description:
      'Learn what information a service may collect about you and your activity.',
    meaning:
      'Data collection happens when a website or app gathers information about you, your device or how you use the service.',
    example:
      'A fitness app may ask for your location, email address and activity information to provide its features.',
    importance:
      'Different types of information can reveal different things about you. Understanding what is collected helps you decide what you are comfortable sharing.',
    tipTitle: 'Check what is really needed',
    tip:
      'Before allowing access, check what information the service is asking for and whether it is needed for the feature you want to use.',
    activity: {
      title: 'Recognising Data Collection',
      description:
        'Review the key ideas about how services collect personal information.',
      recapTitle: 'What should you remember?',
      recap:
        'Data collection is about what information a service gathers from you, your device or your activity.',
      concepts: [
        {
          title: 'Information you provide',
          icon: 'edit',
          text:
            'This can include details such as your name, email address, photos or information entered into a form.',
        },
        {
          title: 'Information collected automatically',
          icon: 'phone',
          text:
            'A service may also collect device information, location or activity while you use it.',
        },
        {
          title: 'What is necessary',
          icon: 'question',
          text:
            'Think about whether the information being requested is needed for the service or feature.',
        },
      ],
      takeawayTitle:
        'Understand what is collected before you share it.',
      takeaway:
        'Before sharing information, understand what is being collected and why it may be needed.',
    },
  },

  {
    slug: 'purpose-of-use',
    how: {
      kind: 'fan',
      title: 'One piece of information, different uses',
      source: { icon: 'mail', label: 'Your email address' },
      items: [
        { icon: 'receipt', label: 'Send your order confirmation', note: 'What you expect' },
        { icon: 'chart', label: 'Improve their website', note: 'Often mentioned' },
        { icon: 'megaphone', label: 'Send you advertising', note: 'Look out for this', flag: true },
      ],
    },
    icon: 'purpose',
    title: 'Purpose of use',
    shortDescription:
      'Learn why an organisation may want to use your information.',
    description:
      'Understand why an organisation wants to use your information.',
    meaning:
      'Purpose of use explains why an organisation collects your information and what it plans to do with it.',
    example:
      'An online store may use your email address to send an order confirmation, but it may also want to use it for marketing.',
    importance:
      'The same information can be used for different purposes. Knowing the purpose helps you understand what you are agreeing to.',
    tipTitle: 'Look for a clear reason',
    tip:
      'Check whether the service clearly explains why it needs your information and whether there are any additional uses.',
    activity: {
      title: 'Understanding Purpose of Use',
      description:
        'Review how to recognise why an organisation wants to use your information.',
      recapTitle: 'What should you remember?',
      recap:
        'Purpose of use tells you why information is collected and what the organisation plans to do with it.',
      concepts: [
        {
          title: 'Main service',
          icon: 'receipt',
          text:
            'Information may be used to provide the feature or service you requested.',
        },
        {
          title: 'Service improvement',
          icon: 'chart',
          text:
            'Some information may be used for analytics, security or improving the service.',
        },
        {
          title: 'Additional uses',
          icon: 'megaphone',
          text:
            'Information may also be used for purposes such as advertising, marketing or personalisation.',
        },
      ],
      takeawayTitle:
        'Always check why your information is being used.',
      takeaway:
        'Do not only look at what data is collected. Also check why the organisation wants to use it.',
    },
  },

  {
    slug: 'data-sharing',
    how: {
      kind: 'fan',
      title: 'Who else may receive your details',
      source: { icon: 'building', label: 'The shop you use' },
      items: [
        { icon: 'truck', label: 'A delivery company', note: 'To bring your order' },
        { icon: 'card', label: 'A payment company', note: 'To take your payment' },
        { icon: 'megaphone', label: 'An advertising company', note: 'Look out for this', flag: true },
      ],
    },
    icon: 'share',
    title: 'Data sharing',
    shortDescription:
      'Understand who your information may be shared with.',
    description:
      'Learn who else may receive or access your information.',
    meaning:
      'Data sharing happens when an organisation provides your information to another company, service provider or third party.',
    example:
      'A shopping website may share your browsing activity with an advertising company.',
    importance:
      'Once information is shared, more organisations may have access to it. It is useful to know who receives the data and why.',
    tipTitle: 'Check who receives your data',
    tip:
      'Look for information about third parties, service providers and the reasons your information may be shared.',
    activity: {
      title: 'Understanding Data Sharing',
      description:
        'Review what to look for when information may be shared with other organisations.',
      recapTitle: 'What should you remember?',
      recap:
        'Data sharing means your information may move from the service you are using to another organisation.',
      concepts: [
        {
          title: 'Who receives it',
          icon: 'building',
          text:
            'Look for third parties, partners or service providers mentioned in the privacy information.',
        },
        {
          title: 'Why it is shared',
          icon: 'question',
          text:
            'Check the reason for sharing, such as payment processing, analytics, advertising or service delivery.',
        },
        {
          title: 'What is shared',
          icon: 'file',
          text:
            'Consider what information is being shared and whether all of it is necessary.',
        },
      ],
      takeawayTitle:
        'Know who else may receive your information.',
      takeaway:
        'When you share data with one service, check whether other organisations may also receive it.',
    },
  },

  {
    slug: 'data-retention',
    how: {
      kind: 'timeline',
      title: 'How long your information may stay on file',
      items: [
        { icon: 'user-plus', label: 'You sign up' },
        { icon: 'calendar', label: 'You stop using the service' },
        { icon: 'archive', label: 'They may still keep it', note: 'Sometimes for years', flag: true },
        { icon: 'trash', label: 'It is deleted' },
      ],
    },
    icon: 'clock',
    title: 'Data retention',
    shortDescription:
      'Learn how long your information may be kept.',
    description:
      'Learn how long your information may be stored and what happens to it later.',
    meaning:
      'Data retention describes how long an organisation keeps your information after it has been collected.',
    example:
      'A service may keep some account information for a period of time even after you stop using the service.',
    importance:
      'Information that is stored for longer remains available for longer. Understanding retention helps you know what may happen to your data over time.',
    tipTitle: 'Look for a retention period',
    tip:
      'Check whether the service explains how long information is kept and when it may be deleted.',
    activity: {
      title: 'Understanding Data Retention',
      description:
        'Review how to understand how long personal information may be stored.',
      recapTitle: 'What should you remember?',
      recap:
        'Data retention is about how long your information remains stored after it is collected.',
      concepts: [
        {
          title: 'Retention period',
          icon: 'calendar',
          text:
            'A policy may give a specific period or explain the conditions used to decide how long data is kept.',
        },
        {
          title: 'Reason for keeping it',
          icon: 'archive',
          text:
            'Organisations may keep information for service, security, record-keeping or other stated purposes.',
        },
        {
          title: 'Deletion',
          icon: 'trash',
          text:
            'Look for information about when data is deleted or what happens after it is no longer needed.',
        },
      ],
      takeawayTitle:
        'Check how long your information may remain stored.',
      takeaway:
        'Check not only what is collected, but also how long the organisation plans to keep it.',
    },
  },

  {
    slug: 'user-control',
    how: {
      kind: 'choices',
      title: 'Choices a service may give you',
      items: [
        { icon: 'eye', label: 'See what they hold about you' },
        { icon: 'edit', label: 'Correct mistakes' },
        { icon: 'trash', label: 'Ask them to delete it' },
        { icon: 'mail', label: 'Say no to marketing' },
      ],
    },
    icon: 'control',
    title: 'Your choices',
    shortDescription:
      'Understand the choices and controls that may be available to you.',
    description:
      'Understand the choices you may have over your personal information.',
    meaning:
      'User control describes the choices and actions available to you after your information has been collected.',
    example:
      'A service may allow you to change permissions, withdraw consent, correct information or request deletion.',
    importance:
      'Your privacy choices may change over time. Clear controls make it easier to manage how your information is used.',
    tipTitle: 'Know your available choices',
    tip:
      'Look for options to change permissions, access or correct information, withdraw consent or request deletion.',
    activity: {
      title: 'Understanding User Control',
      description:
        'Review the privacy choices and controls that may remain available to you.',
      recapTitle: 'What should you remember?',
      recap:
        'User control is about the choices you have over how your information is collected, used and managed.',
      concepts: [
        {
          title: 'Change permissions',
          icon: 'control',
          text:
            'Some services allow you to change privacy or device permissions after you start using them.',
        },
        {
          title: 'Change your consent',
          icon: 'refresh',
          text:
            'Check whether you can withdraw or change consent for certain uses of your information.',
        },
        {
          title: 'Access and manage data',
          icon: 'eye',
          text:
            'Look for options to access, correct or request deletion of your personal information.',
        },
      ],
      takeawayTitle:
        'Privacy choices should remain available.',
      takeaway:
        'Privacy choices should not end after the first consent screen. Check what controls remain available later.',
    },
  },
]

export function getLesson(slug) {
  return LESSONS.find((lesson) => lesson.slug === slug) || null
}
