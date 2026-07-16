// Faithful mini-renders of the 6 "Mindset Mastery Guide" pages.
// Each page is designed at 720px wide and scaled down (thumbnails ~104px, big
// cover ~200px) exactly like the original template.

// ---- COVER (reused for both the big hero cover and the strip) ----
const coverHTML = `
<div style="width:720px;height:932px;background:var(--forest);position:relative;overflow:hidden;color:var(--white);display:flex;flex-direction:column;">
  <img src="/images/workbook-bg.png" alt="" style="position:absolute;left:-148px;bottom:-94px;width:548px;height:auto;z-index:0;display:block;">
  <div style="position:absolute;right:-120px;top:-120px;width:420px;height:420px;border-radius:50%;border:1px solid rgba(231,184,148,.14);"></div>
  <div style="position:absolute;right:-60px;top:-60px;width:280px;height:280px;border-radius:50%;border:1px solid rgba(231,184,148,.1);"></div>
  <div style="padding:96px 64px 0;display:flex;justify-content:center;position:relative;z-index:1;">
    <img src="/images/logo-on-dark.png" alt="My LA Therapy" style="width:300px;height:auto;display:block;">
  </div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-start;text-align:center;padding:40px 70px 0;position:relative;z-index:1;">
    <div style="font-size:14px;letter-spacing:.24em;text-transform:uppercase;color:var(--tan);font-weight:600;margin-bottom:26px;">A CBT WORKBOOK</div>
    <h2 style="font-family:var(--serif);font-weight:500;font-size:72px;line-height:1;color:var(--white);margin:0 0 24px;">Mindset Mastery <span style="font-style:italic;color:var(--tan);">Guide</span></h2>
    <div style="font-size:19px;letter-spacing:.04em;color:var(--sage-pale-2);max-width:330px;margin:0 auto;">A research-based guide for mastering irrational thoughts.</div>
  </div>
  <div style="padding:0 64px 76px;text-align:right;position:relative;z-index:1;">
    <div style="font-family:var(--serif);font-style:italic;font-size:22px;color:var(--tan);margin-bottom:6px;"><span style="display:inline-block;border-bottom:2px solid var(--terracotta);padding-bottom:3px;">Brooke Sprowl, LCSW</span></div>
    <div style="font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:var(--sage-pale-3);">mylatherapy.com</div>
  </div>
</div>`;

// ---- shared bits for the light interior pages ----
const hdr = (logoW, label) => `
  <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:16px;margin-bottom:24px;">
    <img src="/images/logo-on-light.png" alt="My LA Therapy" style="width:${logoW}px;height:auto;">
    <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--terracotta);font-weight:600;">${label}</div>
  </div>`;
const ftr = (n) => `
  <div style="margin-top:auto;padding-top:36px;display:flex;align-items:center;justify-content:space-between;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted-5);"><span>mylatherapy.com</span><span>${n} of 6</span></div>`;

// ---- WELCOME (1 of 6) ----
const welcomeHTML = `
<div style="width:720px;min-height:932px;background:var(--cream-2);display:flex;flex-direction:column;padding:58px 70px 50px;box-sizing:border-box;overflow:hidden;">
  ${hdr(148, 'Mindset Mastery Guide')}
  <div style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--terracotta);font-weight:700;margin-bottom:14px;">Mastering Irrational Thoughts</div>
  <h2 style="font-family:var(--serif);font-weight:500;font-size:36px;line-height:1.12;color:var(--forest-ink);margin:0 0 26px;max-width:540px;">Think of this guide like a workout for your well-being.</h2>
  <div style="font-size:15.5px;line-height:1.62;color:var(--ink-3);display:flex;flex-direction:column;gap:12px;max-width:580px;">
    <p style="margin:0;">The more you practice, the better your mental endurance and fitness will be. Practice often to create greater resiliency, self-esteem, and courage.</p>
    <p style="margin:0;">Often our anxiety, depression, and poor self-esteem are triggered by <strong style="color:var(--forest-ink);">Thought Distortions</strong> that reinforce our deepest fears about ourselves, others, and our future.</p>
    <p style="margin:0;">We tend to unquestioningly accept these Thought Distortions as true when we leave them unchecked and do not examine them more deeply.</p>
    <p style="margin:0;">With a deeper investigation of our Thought Distortions, we may discover important truths about ourselves and how these knee-jerk, reactive thoughts contribute to our negative, Self-Limiting Core Beliefs and narratives.</p>
    <p style="margin:0;"><strong style="color:var(--forest-ink);">Cognitive Behavioral Therapy (CBT)</strong> is a research-proven technique that can help transform depression, anxiety, and low self-esteem and help us see ourselves and the world in more empowering, balanced, and realistic ways.</p>
    <p style="margin:0;">CBT takes the scientific method and uses it to kick Distorted Thoughts to the curb so we can become more confident, peaceful, and hopeful.</p>
    <p style="margin:0;">This is the beginning of creating the life you've always wanted and becoming the person you've always wanted to be.</p>
  </div>
  ${ftr(1)}
</div>`;

// ---- record card helper (worked example / your turn) ----
const card = (accent, title, desc, body) => `
  <div style="background:${accent === 'var(--forest)' ? 'var(--forest)' : 'var(--white)'};border:1px solid var(--border);${accent !== 'var(--forest)' ? `border-left:4px solid ${accent};` : 'border:none;'}border-radius:13px;padding:11px 20px;box-shadow:0 6px 18px -14px rgba(33,58,48,.4);flex:1;min-height:0;">
    <div style="font-family:var(--serif);font-size:18px;line-height:1.08;color:${accent === 'var(--forest)' ? 'var(--white)' : 'var(--forest-ink)'};margin-bottom:3px;">${title}</div>
    <div style="font-size:12px;line-height:1.4;color:${accent === 'var(--forest)' ? 'var(--sage-pale-2)' : 'var(--muted)'};margin-bottom:7px;">${desc}</div>
    ${body}
  </div>`;
const chips = (arr, bg = 'var(--mint)', fg = 'var(--forest-mid)') => `<div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:10px;">${arr.map((t) => `<span style="background:${bg};color:${fg};font-size:12px;padding:3px 12px;border-radius:999px;">${t}</span>`).join('')}</div>`;
const quote = (t) => `<div style="font-family:var(--serif);font-style:italic;font-size:14px;line-height:1.35;color:var(--forest);margin-top:10px;">${t}</div>`;
const blanks = `<div style="margin-top:6px;"><div style="height:19px;border-bottom:1px solid var(--border);"></div><div style="height:19px;border-bottom:1px solid var(--border);"></div></div>`;

const recordShell = (badge, cardsHTML, n) => `
<div style="width:720px;min-height:932px;background:var(--cream);display:flex;flex-direction:column;padding:46px 56px 34px;box-sizing:border-box;overflow:hidden;">
  <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:13px;margin-bottom:16px;"><img src="/images/logo-on-light.png" alt="My LA Therapy" style="width:130px;height:auto;"><div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--terracotta);font-weight:600;">The Thought Record</div></div>
  <div style="margin-bottom:13px;">${badge}</div>
  <div style="display:flex;flex-direction:column;gap:8px;flex:1;min-height:0;">${cardsHTML}</div>
  ${ftr(n)}
</div>`;

const workedHTML = recordShell(
  `<span style="background:var(--sand);color:var(--amber-ink);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;padding:5px 14px;border-radius:999px;">Worked example</span>`,
  card('var(--sage)', 'Trigger Situation', 'What happened, where, and who were you with?', quote('"I had a fight with my boyfriend about moving in together."')) +
  card('var(--sage)', 'Trigger Feelings', 'Name the feelings that arose, and rate each 1–10.', chips(['Anxious · 8', 'Depressed · 7', 'Rejected · 5'])) +
  card('var(--terracotta)', 'Your Thought Distortion', 'What went through your mind?', quote('"He’s going to break up with me." "No one will ever love me."')) +
  card('var(--terracotta)', 'Evidence — The Lawyer', 'List only the facts that support this thought.', quote('"My past relationships were ended by my partners. He said he doesn’t want to move in."')) +
  card('var(--forest)', 'Thought Transformation — The Judge', 'Weigh both sides into one balanced statement.', `<div style="font-family:var(--serif);font-style:italic;font-size:14px;line-height:1.35;color:var(--tan);margin-top:6px;">"Even though I’ve felt rejection before, many people love me and I am not alone."</div>`) +
  card('var(--forest)', 'Rate Feelings', 'Now re-rate your Trigger Feelings from 1–10.', chips(['Anxious · 4', 'Depressed · 3', 'Rejected · 1'])).replace('var(--forest)', 'var(--white)'),
  2
);

const yourTurnHTML = recordShell(
  `<span style="background:var(--mint);color:var(--green-check);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;padding:5px 14px;border-radius:999px;">Your turn</span>`,
  card('var(--sage)', 'Trigger Situation', 'What happened, where, and who were you with?', blanks) +
  card('var(--sage)', 'Trigger Feelings', 'Name the feelings that arose, and rate each 1–10.', blanks) +
  card('var(--terracotta)', 'Your Thought Distortion', 'What went through your mind?', blanks) +
  card('var(--terracotta)', 'Evidence — The Lawyer', 'List only the facts that support this thought.', blanks) +
  card('var(--forest)', 'Thought Transformation — The Judge', 'Weigh both sides into one balanced statement.', blanks).replace('var(--forest)', 'var(--forest)') +
  card('var(--forest)', 'Rate Feelings', 'Now re-rate your Trigger Feelings from 1–10.', blanks).replace('var(--forest)', 'var(--white)'),
  3
);

// ---- CHALLENGE PROMPTS (4 of 6) ----
const prompts = [
  'Have I had any experiences that show that this thought is not completely true all the time?',
  'If my best friend had this Thought Distortion, what would I tell them?',
  'If someone who loves me knew I was thinking this, what evidence would they point out?',
  'When I am not feeling this way, do I think about this type of situation differently?',
  'When I have felt this way in the past, what did I think that helped me feel better?',
  'Have I been in this type of situation before? What did I learn from it?',
  'Are there small things that contradict my Thought Distortion that I’m discounting?',
  'Five years from now, will I look at this situation any differently?',
  'Are there strengths or positives in me or the situation that I am ignoring?',
  'Am I blaming myself for something over which I do not have complete control?',
];
const promptsHTML = `
<div style="width:720px;min-height:932px;background:var(--cream-2);display:flex;flex-direction:column;padding:54px 70px 44px;box-sizing:border-box;overflow:hidden;">
  ${hdr(148, 'Mindset Mastery Guide')}
  <div style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--terracotta);font-weight:700;margin-bottom:12px;">Prompts</div>
  <h2 style="font-family:var(--serif);font-weight:500;font-size:27px;line-height:1.14;color:var(--forest-ink);margin:0 0 16px;max-width:560px;">Questions to help challenge your Thought Distortions</h2>
  <div style="display:flex;flex-direction:column;font-size:14px;line-height:1.45;color:var(--ink-3);">
    ${prompts.map((p, i) => `<div style="display:flex;gap:14px;padding:7px 0;${i < prompts.length - 1 ? 'border-bottom:1px solid var(--border-7);' : ''}"><span style="color:var(--terracotta);font-family:var(--serif);font-style:italic;flex:none;width:22px;">${String(i + 1).padStart(2, '0')}</span><span>${p}</span></div>`).join('')}
  </div>
  ${ftr(4)}
</div>`;

// ---- NEXT STEPS (6 of 6) ----
const nextHTML = `
<div style="width:720px;min-height:932px;background:var(--forest);position:relative;display:flex;flex-direction:column;padding:64px 70px 80px;box-sizing:border-box;color:var(--white);overflow:hidden;">
  <div style="position:absolute;right:-110px;bottom:-110px;width:360px;height:360px;border-radius:50%;border:1px solid rgba(231,184,148,.12);"></div>
  <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(231,184,148,.2);padding-bottom:18px;margin-bottom:48px;"><img src="/images/logo-on-dark.png" alt="My LA Therapy" style="width:148px;height:auto;"><div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--tan);font-weight:600;">Next steps</div></div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;max-width:560px;position:relative;z-index:1;">
    <h2 style="font-family:var(--serif);font-weight:500;font-size:44px;line-height:1.05;color:var(--white);margin:0 0 28px;">Next steps<span style="font-style:italic;color:var(--tan);">.</span></h2>
    <div style="font-size:16px;line-height:1.7;color:var(--sage-pale);display:flex;flex-direction:column;gap:16px;">
      <p style="margin:0;">Our Thought Mastery Guide is just one of many research-proven tools we use to help you overcome your inner roadblocks and support your self-transformation.</p>
      <p style="margin:0;">To dive deeper, book a free call with our Matching Specialist so we can pair you with one of our warm, experienced therapists.</p>
    </div>
    <div style="margin:30px 0 24px;"><span style="display:inline-block;background:var(--terracotta);color:var(--white);font-weight:600;font-size:16px;padding:16px 34px;border-radius:999px;box-shadow:0 18px 36px -16px rgba(0,0,0,.5);">Book a free call →</span></div>
  </div>
  <div style="display:flex;align-items:center;justify-content:space-between;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--sage-pale-3);border-top:1px solid rgba(231,184,148,.2);padding-top:24px;position:relative;z-index:1;"><span style="font-family:var(--serif);font-style:italic;text-transform:none;letter-spacing:0;font-size:18px;color:var(--tan);">Brooke Sprowl</span><span>6 of 6</span></div>
</div>`;

const strip = [
  { label: 'Cover', html: coverHTML },
  { label: 'Welcome', html: welcomeHTML },
  { label: 'Worked example', html: workedHTML },
  { label: 'Your turn', html: yourTurnHTML },
  { label: 'Challenge prompts', html: promptsHTML },
  { label: 'Next steps', html: nextHTML },
];


export { coverHTML, strip };
