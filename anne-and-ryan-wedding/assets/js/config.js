/* Site config. Paste the Google Apps Script web-app URL below (see README → "Connect Google Sheets").
   Leave it empty to run in demo mode: everything works but data is only saved in this browser. */
window.WEDDING_CONFIG = {
  SHEETS_URL: "https://script.google.com/macros/s/AKfycbwQhSGcBC5b9NM1cZOeUO0G36JdCyobdRdrUZ8NVYFaJoL0n42SrGXRBiJHPDmX3vpBWg/exec",

  // RSVPs go into a Google Form (made by `setup` in apps-script/Code.gs; it logs these values).
  // Leave action empty to send RSVPs to SHEETS_URL instead (or demo mode).
  RSVP_FORM: {
    action: "https://docs.google.com/forms/d/e/1FAIpQLSd4f9318op4E2eGWigfH9Q8XhG5R_QXwEB6Yw9DVoUIlaIp4A/formResponse",
    name: "entry.790492731", email: "entry.720971130", attending: "entry.1436323282", food: "entry.1766302204"
  },

  // Notes per arch before they start sharing space (more notes = tighter spacing)
  ARCH_MAX_COMFORTABLE: 24,

  // Max flowers per bouquet
  MAX_FLOWERS: 4,

  // Message length limit
  MAX_MESSAGE: 1500
};
