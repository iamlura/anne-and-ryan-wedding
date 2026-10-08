/* Basic inappropriate-content filter (English + Filipino). Same list runs server-side in Code.gs.
   Catches common spellings, spacing tricks (f u c k) and leetspeak (sh1t). It's a guardrail, not a moderator:
   Anne can still hide any note by setting the "hidden" column to TRUE in the sheet. */
(function () {
  const WORDS = [
    "fuck", "fuk", "fck", "shit", "bitch", "bastard", "asshole", "dick", "cock", "pussy", "cunt", "slut", "whore",
    "nigger", "nigga", "faggot", "fag", "retard", "motherfucker", "wtf", "porn", "sex", "nude", "rape", "kill yourself", "kys",
    "putangina", "putang ina", "tangina", "tang ina", "puta", "gago", "gaga", "bobo", "tanga", "ulol", "ulul", "tarantado",
    "lintik", "pakyu", "pakshet", "punyeta", "kupal", "hayop ka", "kantot", "puke", "pokpok", "inutil", "hindot"
  ];
  const LEET = { "0": "o", "1": "i", "!": "i", "3": "e", "4": "a", "@": "a", "5": "s", "$": "s", "7": "t", "8": "b" };

  function normalize(s) {
    return String(s || "").toLowerCase()
      .replace(/[0134578@$!]/g, (c) => LEET[c] || c)
      .normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function hasBadWords(text) {
    const n = normalize(text);
    const words = " " + n.replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ") + " ";
    return WORDS.some((w) => {
      if (words.includes(" " + w + " ")) return true;                        // whole word / phrase
      // spaced or dotted letters (f u c k, f.u.c.k) plus common endings
      const letters = w.replace(/\s/g, "").split("").join("\\s?");
      return new RegExp("\\s" + letters + "(s|es|ed|ing|in|er|ers)?\\s").test(words);
    });
  }

  window.ContentFilter = { hasBadWords };
})();
