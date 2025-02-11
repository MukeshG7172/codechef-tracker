import * as cheerio from "cheerio";

interface ContestDetails {
  contestName: string;
  problemsSolved: string[];
}

export async function getCodechefRank(username: string) {
  try {
    const { default: got } = await import("got");

    const url = `https://www.codechef.com/users/${username}`;
    const html = await got(url).text();
    const $ = cheerio.load(html);

    const url1 = `https://codechef-api.vercel.app/handle/${username}`;
    const response1 = await got(url1).json<any>();

    const cleanText = (text: string) => text.replace(/\s+/g, " ").trim();

    // Extract details from API response
    let name: string = response1.name;
    let currentRating: number = response1.currentRating;
    let highestRating: number = response1.highestRating;
    let globalRank: number = response1.globalRank;
    let countryRank: number = response1.countryRank;
    let stars: string = response1.stars;
    let latestContestData: any = response1.ratingData[response1.ratingData.length - 1];

    // Extract last contest problems solved
    const lastContest = cleanText($(".problems-solved .content").last().text());
    const contestPattern = /(Starters \d+.*?)(?=Starters \d+|$)/g;
    const contest = lastContest.match(contestPattern);

    const contestDetailsArray: ContestDetails[] =
      contest?.map((contest) => {
        const [contestName, ...problems] = contest.split(/(?<=\))\s*/);
        const problemsSolved = problems.join("").split(", ").map(cleanText);
        return {
          contestName: cleanText(contestName),
          problemsSolved: problemsSolved.length > 0 ? problemsSolved : ["N/A"],
        };
      }) || [];

    // Plagiarism details
    const plagiarismStatus = latestContestData.reason
      ? `Penalized for: ${latestContestData.reason}`
      : "No plagiarism detected";

    const contestDetails = {
      code: latestContestData.code,
      name: latestContestData.name,
      rank: latestContestData.rank,
      rating: latestContestData.rating,
      date: latestContestData.end_date.split(" ")[0],
      problemsSolved: contestDetailsArray.flatMap((contest) => contest.problemsSolved),
      plagiarismStatus,
    };

    const result = {
      name,
      globalRank,
      countryRank,
      currentRating,
      highestRating,
      stars,
      lastContestDetails: contestDetails,
    };

    return result;
  } catch (error) {
    console.error(`Error fetching CodeChef details for ${username}:`, error);
    return null;
  }
}

// Example usage
getCodechefRank("rajkalyant").then(console.log);
