
import { GoogleGenAI, Type } from "@google/genai";
import { Character, Group, UserStats } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Hardcoded characters - no AI needed
export async function generateCharacters(): Promise<Character[]> {
  // Simulate a tiny delay to match async behavior, but return immediately
  return Promise.resolve([
    {
      name: "יעל כהן",
      description: "מורה לספרות בתיכון, אוהבת לטייל בטבע ולקרוא ספרי מתח. גרה בתל אביב עם שני חתולים.",
      group: Group.OVER,
      avatar: "https://picsum.photos/seed/yael/200"
    },
    {
      name: "אורי לוי",
      description: "מהנדס תוכנה במשרד היי-טק, מתנדב בארגון חינוכי בסופי שבוע. חובב קפה וסרטי מדע בדיוני.",
      group: Group.UNDER,
      avatar: "https://picsum.photos/seed/uri/200"
    },
    {
      name: "מיכל שפירא",
      description: "סטודנטית לפסיכולוגיה, עובדת במשרה חלקית בבית קפה. מנגנת בגיטרה ומשתתפת בהופעות מוזיקליות.",
      group: Group.OVER,
      avatar: "https://picsum.photos/seed/michal/200"
    },
    {
      name: "דן אברהם",
      description: "מנהל חשבונות בחברה קטנה, נשוי ואב לשלושה. אוהב לבשל ולארח חברים בסופי שבוע.",
      group: Group.UNDER,
      avatar: "https://picsum.photos/seed/dan/200"
    }
  ]);
}

export async function generateDebrief(stats: UserStats, userGroup: Group): Promise<string> {
  const prompt = `
    בהתבסס על סימולציה של ניסוי פסיכולוגי בנושא "פרדיגמת הקבוצה המינימלית":
    הקבוצה של המשתמש: ${userGroup}
    ממוצע נקודות שניתנו לחברי הקבוצה (In-Group): ${stats.inGroupAvgPoints.toFixed(1)}
    ממוצע נקודות שניתנו לקבוצה השנייה (Out-Group): ${stats.outGroupAvgPoints.toFixed(1)}
    דירוג חברתי ממוצע לקבוצה של המשתמש: ${stats.inGroupAvgRating.toFixed(1)}
    דירוג חברתי ממוצע לקבוצה השנייה: ${stats.outGroupAvgRating.toFixed(1)}
    
    ציון ההטיה של המשתמש הוא ${stats.biasScore.toFixed(2)} (ציון חיובי אומר העדפה של הקבוצה שלו).
    
    כתוב סיכום (Debrief) פסיכולוגי מקצועי אך מרתק ב-3 פסקאות בעברית המסביר את התנהגות המשתמש בהקשר של פרדיגמת הקבוצה המינימלית.
    הסבר כיצד תוויות שרירותיות (${Group.OVER} לעומת ${Group.UNDER}) השפיעו על קבלת ההחלטות שלו.
    כלול השלכות מהעולם האמיתי לגבי שבטיות או קיטוב חברתי.
    כתוב ישירות למשתמש בטון תומך ומלמד.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });

  return response.text || "לא ניתן היה להפיק ניתוח סיכום כרגע.";
}
