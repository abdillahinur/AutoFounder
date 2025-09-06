// JSON structure for all standard pitch deck slides
// Each slide type has unique fields and layout metadata

export const deckTemplates = {
  cover: {
    slideType: "cover",
    fields: {
      startupName: {
        placeholder: "[Startup Name]",
        position: "center",
        fontSize: 48,
        fontWeight: "bold",
        color: "#222"
      },
      oneLiner: {
        placeholder: "[One-line Pitch]",
        position: "center-below",
        fontSize: 32,
        fontWeight: "normal",
        color: "#888"
      }
    },
    background: null
  },
  problem: {
    slideType: "problem",
    fields: {
      problem: {
        placeholder: "[Problem Description]",
        position: "center",
        fontSize: 28,
        color: "#444"
      }
    },
    background: null
  },
  solution: {
    slideType: "solution",
    fields: {
      solution: {
        placeholder: "[Solution Description]",
        position: "center",
        fontSize: 28,
        color: "#444"
      }
    },
    background: null
  },
  market: {
    slideType: "market",
    fields: {
      market: {
        placeholder: "[Market Size]",
        position: "center",
        fontSize: 28,
        color: "#444"
      }
    },
    background: null
  },
  business_model: {
    slideType: "business_model",
    fields: {
      model: {
        placeholder: "[Business Model Description]",
        position: "center",
        fontSize: 28,
        color: "#444"
      }
    },
    background: null
  },
  traction: {
    slideType: "traction",
    fields: {
      traction: {
        placeholder: "[Traction or Roadmap Description]",
        position: "center",
        fontSize: 28,
        color: "#444"
      }
    },
    background: null
  },
  team: {
    slideType: "team",
    fields: {
      team: {
        placeholder: "[Team Members]",
        position: "center",
        fontSize: 28,
        color: "#444"
      }
    },
    background: null
  },
  ask: {
    slideType: "ask",
    fields: {
      ask: {
        placeholder: "[Ask Description]",
        position: "center",
        fontSize: 28,
        color: "#444"
      }
    },
    background: null
  }
};
