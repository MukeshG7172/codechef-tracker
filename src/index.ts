import axios from "axios";
import * as cheerio from "cheerio";

interface ContestDetails {
  contestName: string;
  problemsSolved: string[];
}

export async function getCodechefRank(username: string) {
  try {
    const url = `https://www.codechef.com/users/${username}`;
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    
    const url1 = `https://codechef-api.vercel.app/handle/${username}`;
    const response1 = await axios.get(url1);
    
    const cleanText = (text: string) => text.replace(/\s+/g, " ").trim();

    // Helper function to clean text
    let name:string = response1.data.name;
    let currentRating:number = response1.data.currentRating;
    let highestRating:number = response1.data.highestRating;
    let globalRank:number = response1.data.globalRank;
    let countryRank:number = response1.data.countryRank;
    let stars:string = response1.data.stars;
    let latestContestData:any = response1.data.ratingData[response1.data.ratingData.length-1];
   
    const lastContest = cleanText($(".problems-solved .content").last().text());
    const contestPattern = /(Starters \d+.*?)(?=Starters \d+|$)/g;
    const contest = lastContest.match(contestPattern);

    const contestDetailsArray: ContestDetails[] = contest?.map((contest) => {
      const [contestName, ...problems] = contest.split(/(?<=\))\s*/); // Split by first occurrence of problem descriptions
      const problemsSolved = problems.join("").split(", ").map(cleanText); // Format problem list
      return {
        contestName: cleanText(contestName),
        problemsSolved: problemsSolved.length > 0 ? problemsSolved : ["N/A"],
      };
    }) || [];

    const contestDetails ={
      code: latestContestData.code,
      name: latestContestData.name,
      rank: latestContestData.rank,
      rating: latestContestData.rating,
      date: latestContestData.end_date.split(" ")[0],
      problemsSolved: contestDetailsArray.flatMap(contest => contest.problemsSolved),
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
