import * as cheerio from "cheerio";

interface ContestDetails {
  contestName: string;
  problemsSolved: string[];
}

export async function getCodechefRank(username: string) {
  try {
    const { default: got } = await import("got");

    const url = `https://codechef-api.vercel.app/handle/${username}`;
    const response = await got(url).json<any>();

    if (!response.success) {
      throw new Error("Failed to fetch user data");
    }

    // Extract user details
    let name: string = response.name;
    let currentRating: number = response.currentRating;
    let highestRating: number = response.highestRating;
    let globalRank: number = response.globalRank;
    let countryRank: number = response.countryRank;
    let stars: string = response.stars;

    // Get latest contest details
    let latestContestData: any = response.ratingData[response.ratingData.length - 1];

    let contestDetails = {
      code: latestContestData.code,
      name: latestContestData.name,
      rank: latestContestData.rank,
      rating: latestContestData.rating,
      date: latestContestData.end_date.split(" ")[0],
      problemsSolved: latestContestData.problemsSolved || ["N/A"],
      plagiarism: latestContestData.reason || "No plagiarism detected", // Check for plagiarism
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
