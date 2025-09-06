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
      oneLinePitch: {
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
      title: {
        placeholder: "Problem",
        position: "top",
        fontSize: 36,
        fontWeight: "bold",
        color: "#222"
      },
      description: {
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
      title: {
        placeholder: "Solution",
        position: "top",
        fontSize: 36,
        fontWeight: "bold",
        color: "#222"
      },
      description: {
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
      title: {
        placeholder: "Market Size",
        position: "top",
        fontSize: 36,
        fontWeight: "bold",
        color: "#222"
      },
      tam: {
        placeholder: "[TAM]",
        position: "center-left",
        fontSize: 28,
        color: "#444"
      },
      sam: {
        placeholder: "[SAM]",
        position: "center",
        fontSize: 28,
        color: "#444"
      },
      som: {
        placeholder: "[SOM]",
        position: "center-right",
        fontSize: 28,
        color: "#444"
      },
      chartData: {
        placeholder: "[Chart Data]",
        position: "bottom",
        fontSize: 20,
        color: "#888"
      }
    },
    background: null
  },
  business_model: {
    slideType: "business_model",
    fields: {
      title: {
        placeholder: "Business Model",
        position: "top",
        fontSize: 36,
        fontWeight: "bold",
        color: "#222"
      },
      description: {
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
      title: {
        placeholder: "Traction / Roadmap",
        position: "top",
        fontSize: 36,
        fontWeight: "bold",
        color: "#222"
      },
      description: {
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
      title: {
        placeholder: "Team",
        position: "top",
        fontSize: 36,
        fontWeight: "bold",
        color: "#222"
      },
      members: {
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
      title: {
        placeholder: "Ask",
        position: "top",
        fontSize: 36,
        fontWeight: "bold",
        color: "#222"
      },
      description: {
        placeholder: "[Ask Description]",
        position: "center",
        fontSize: 28,
        color: "#444"
      }
    },
    background: null
  }
};
