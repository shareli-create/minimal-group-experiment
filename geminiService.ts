import { Character, Group, UserStats } from "./types";

// Hardcoded characters - no AI needed
export async function generateCharacters(): Promise<Character[]> {
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
  const biasDirection = stats.biasScore > 0 ? "העדפה לקבוצה שלך" : stats.biasScore < 0 ? "העדפה לקבוצה השנייה" : "ניטרליות";
  
  return `
התוצאות שלך מדגימות תופעה פסיכולוגית מרתקת הידועה כ"פרדיגמת הקבוצה המינימלית". למרות שחלוקת הקבוצות הייתה שרירותית לחלוטין - מבוססת רק על הערכת נקודות - מצאת את עצמך מפגין ${biasDirection} בהקצאת משאבים ובדירוג חברתי. זוהי דוגמה קלאסית לאופן שבו אנו נוטים ליצור חלוקות חברתיות אפילו כשאין להן משמעות אמיתית.

ציון ההטיה שלך היה ${stats.biasScore.toFixed(2)}, המעיד על ${Math.abs(stats.biasScore) < 0.3 ? "הטיה מתונה" : "הטיה בולטת"} בהחלטות שלך. חלקת בממוצע ${stats.inGroupAvgPoints.toFixed(1)} נקודות לחברי הקבוצה שלך ו-${stats.outGroupAvgPoints.toFixed(1)} נקודות לחברי הקבוצה השנייה. בדירוגים החברתיים, הענקת ממוצע של ${stats.inGroupAvgRating.toFixed(1)} לקבוצה שלך לעומת ${stats.outGroupAvgRating.toFixed(1)} לקבוצה השנייה. התבניות הללו חושפות את הנטייה הטבעית שלנו להעדיף את "השבט" שלנו, גם כשהקבוצה נוצרה באופן מלאכותי לחלוטין.

תופעה זו מסבירה תהליכים רבים בעולם האמיתי: מקיטוב פוליטי ועד עימותים בין קבוצות חברתיות. כשאנו מבינים שהמוח שלנו נוטה באופן אוטומטי ליצור חלוקות ולהעדיף את הקבוצה הפנימית שלנו, אנחנו יכולים להיות מודעים יותר להטיות אלו ולעבוד על התגברות עליהן. המודעות לתופעה זו היא הצעד הראשון לקראת חשיבה ביקורתית על ההשפעות החברתיות והפוליטיות שלה.
  `.trim();
}
