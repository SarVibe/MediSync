import axios from "../../../app/axios";

export const checkSymptoms = (symptoms) => {
  // Mock AI response delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        possibleConditions: [
          { name: "Common Cold", probability: "High", advice: "Rest and stay hydrated. Over-the-counter medicine can help." },
          { name: "Seasonal Allergies", probability: "Medium", advice: "Avoid allergens and consider antihistamines." }
        ],
        urgency: "LOW",
        recommendation: "Book a consultation with a General Physician if symptoms persist for more than 3 days."
      });
    }, 1500);
  });
  // In real scenario: return axios.post("/ai/symptom-checker", { symptoms }).then(r => r.data);
};
