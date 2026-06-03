import type { SQLiteDatabase } from 'expo-sqlite';

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function seedDatabase(db: SQLiteDatabase): void {
  const words = [
    {
      word: 'Articulate',
      part_of_speech: 'adjective/verb',
      definition: 'Able to express ideas clearly and effectively.',
      example_email: 'Please articulate your response clearly in the email.',
      example_interview: 'Can you articulate why you are the best fit for this role?',
      example_slack: 'Could you articulate the blocker so the team can help?',
      date_assigned: dateOffset(0),
    },
    {
      word: 'Proactive',
      part_of_speech: 'adjective',
      definition: 'Taking initiative by acting before a situation becomes urgent.',
      example_email: 'I wanted to be proactive and send you the report ahead of schedule.',
      example_interview: 'Tell me about a time you were proactive in preventing an issue.',
      example_slack: 'Just being proactive - here is the update before the standup.',
      date_assigned: dateOffset(1),
    },
    {
      word: 'Collaborate',
      part_of_speech: 'verb',
      definition: 'To work jointly with others toward a shared goal.',
      example_email: 'I would love to collaborate with your team on this initiative.',
      example_interview: 'Describe a project where you had to collaborate across departments.',
      example_slack: 'Let us collaborate on this doc - I have shared edit access.',
      date_assigned: dateOffset(2),
    },
    {
      word: 'Leverage',
      part_of_speech: 'verb',
      definition: 'To use something to its maximum advantage.',
      example_email: 'We can leverage our existing partnerships to accelerate the launch.',
      example_interview: 'How did you leverage your skills to drive results in your last role?',
      example_slack: 'Let us leverage the new tool to speed up the review process.',
      date_assigned: dateOffset(3),
    },
    {
      word: 'Transparent',
      part_of_speech: 'adjective',
      definition: 'Open, honest, and not concealing information.',
      example_email: 'I want to be transparent about the current project timeline.',
      example_interview: 'I value being transparent with stakeholders about risks and progress.',
      example_slack: "Being transparent here - we're running a day behind schedule.",
      date_assigned: dateOffset(4),
    },
    {
      word: 'Initiative',
      part_of_speech: 'noun',
      definition: 'The ability to assess and take action independently.',
      example_email: 'I took the initiative to draft a proposal for your review.',
      example_interview: 'Can you give an example of when you showed initiative at work?',
      example_slack: 'Took the initiative and fixed the bug before the meeting.',
      date_assigned: dateOffset(5),
    },
    {
      word: 'Concise',
      part_of_speech: 'adjective',
      definition: 'Giving a lot of information clearly in a few words.',
      example_email: 'Please keep your summary concise - two paragraphs maximum.',
      example_interview: 'I try to be concise when presenting to senior leadership.',
      example_slack: 'Quick concise update: done, waiting for QA sign-off.',
      date_assigned: dateOffset(6),
    },
    {
      word: 'Prioritize',
      part_of_speech: 'verb',
      definition: 'To arrange tasks in order of importance or urgency.',
      example_email: 'Could we prioritize this request given the upcoming deadline?',
      example_interview: 'How do you prioritize competing tasks when everything feels urgent?',
      example_slack: 'Can we prioritize the login bug today? Clients are affected.',
      date_assigned: dateOffset(7),
    },
    {
      word: 'Delegate',
      part_of_speech: 'verb',
      definition: 'To assign responsibility or authority to another person.',
      example_email: 'I will delegate this task to our lead developer for follow-through.',
      example_interview: 'How do you decide when to delegate versus handle something yourself?',
      example_slack: 'Delegating the review to Ana - she has the full context.',
      date_assigned: dateOffset(8),
    },
    {
      word: 'Accountable',
      part_of_speech: 'adjective',
      definition: 'Responsible for actions and obligated to report them.',
      example_email: 'Our team is fully accountable for delivering this by Friday.',
      example_interview: 'Tell me about a time you held yourself accountable for a mistake.',
      example_slack: "Holding myself accountable - that was my error and I've fixed it.",
      date_assigned: dateOffset(9),
    },
  ];

  for (const w of words) {
    db.runSync(
      `INSERT INTO words (word, part_of_speech, definition, example_email, example_interview, example_slack, date_assigned)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      w.word,
      w.part_of_speech,
      w.definition,
      w.example_email,
      w.example_interview,
      w.example_slack,
      w.date_assigned
    );
  }

  const drills = [
    {
      taglish: 'Pwede ba nating i-discuss yung project bukas?',
      professional: 'Could we discuss the project tomorrow?',
      tip: "Use 'Could we' instead of 'Pwede ba' for a polished, formal tone.",
    },
    {
      taglish: 'Di ko gets yung instructions.',
      professional: 'I need clarification on the instructions.',
      tip: "Use 'clarification' instead of 'gets' in formal settings.",
    },
    {
      taglish: 'Mag-f-follow up ako sa client.',
      professional: 'I will follow up with the client.',
      tip: "Drop the Taglish verb prefix - 'will follow up' is clean and direct.",
    },
    {
      taglish: 'Yung deadline natin ay bukas, kaya rush tayo.',
      professional: 'Our deadline is tomorrow, so we need to move quickly.',
      tip: "Replace 'rush' with 'move quickly' for a more composed impression.",
    },
    {
      taglish: 'Paki-explain ulit yung process.',
      professional: 'Could you walk me through the process again?',
      tip: "'Walk me through' sounds more engaged and collaborative than 'explain again'.",
    },
    {
      taglish: 'Hindi ako agree sa plano.',
      professional: 'I have some concerns about the proposed plan.',
      tip: "Softening disagreement with 'concerns' shows professionalism, not weakness.",
    },
    {
      taglish: 'Kelan ba matatapos yung report?',
      professional: 'When can we expect the report to be completed?',
      tip: "'When can we expect' is more respectful than asking 'when will it be done'.",
    },
    {
      taglish: 'Mag-aask lang ako ng update.',
      professional: "I'd like to request a status update.",
      tip: "'Request a status update' sounds formal and non-intrusive.",
    },
    {
      taglish: 'Maraming tasks ako ngayon.',
      professional: "I'm currently managing several priorities.",
      tip: "'Managing priorities' signals competence rather than being overwhelmed.",
    },
    {
      taglish: 'Pwede mo ba ako tulungan dito?',
      professional: 'Would you be able to assist me with this?',
      tip: "'Would you be able to' is more polite and professional than 'Can you help me'.",
    },
  ];

  for (const d of drills) {
    db.runSync(
      'INSERT INTO drills (taglish, professional, tip) VALUES (?, ?, ?)',
      d.taglish,
      d.professional,
      d.tip
    );
  }

  const phrases = [
    {
      phrase: 'I hope this message finds you well.',
      example: 'I hope this message finds you well. I am writing to follow up on our last meeting.',
      category: 'Opening Emails',
    },
    {
      phrase: 'I wanted to follow up on...',
      example: 'I wanted to follow up on the proposal I sent last week.',
      category: 'Opening Emails',
    },
    {
      phrase: 'I am reaching out regarding...',
      example: 'I am reaching out regarding the open position on your team.',
      category: 'Opening Emails',
    },
    {
      phrase: 'I see your point, however...',
      example: 'I see your point, however I think we should consider an alternative approach.',
      category: 'Disagreeing',
    },
    {
      phrase: 'I would like to offer a different perspective.',
      example: 'I would like to offer a different perspective on the proposed timeline.',
      category: 'Disagreeing',
    },
    {
      phrase: 'With respect, I think we should consider...',
      example: 'With respect, I think we should consider the impact on end users before deciding.',
      category: 'Disagreeing',
    },
    {
      phrase: 'What I would like to propose is...',
      example: 'What I would like to propose is a phased rollout starting next quarter.',
      category: 'Presenting',
    },
    {
      phrase: 'The key takeaway here is...',
      example: 'The key takeaway here is that customer retention improved by 20%.',
      category: 'Presenting',
    },
    {
      phrase: 'To summarize my point...',
      example: 'To summarize my point, the data supports moving forward with Plan B.',
      category: 'Presenting',
    },
    {
      phrase: 'Based on my experience, I was expecting...',
      example: 'Based on my experience, I was expecting a salary in the range of 80 to 90 thousand.',
      category: 'Negotiating',
    },
    {
      phrase: 'Is there flexibility in the compensation package?',
      example: 'Is there flexibility in the compensation package, particularly around the base salary?',
      category: 'Negotiating',
    },
    {
      phrase: 'I would like to discuss the offer further.',
      example: 'Thank you for the offer. I would like to discuss it further before making a decision.',
      category: 'Negotiating',
    },
    {
      phrase: 'How has your week been so far?',
      example: "How has your week been so far? We've had quite a busy one on our end.",
      category: 'Small Talk',
    },
    {
      phrase: 'Did you have a good weekend?',
      example: 'Did you have a good weekend? I finally managed to get some rest.',
      category: 'Small Talk',
    },
    {
      phrase: "It's been a busy quarter, hasn't it?",
      example: "It's been a busy quarter, hasn't it? The team has really stepped up.",
      category: 'Small Talk',
    },
  ];

  for (const p of phrases) {
    db.runSync(
      'INSERT INTO phrases (phrase, example, category) VALUES (?, ?, ?)',
      p.phrase,
      p.example,
      p.category
    );
  }
}
