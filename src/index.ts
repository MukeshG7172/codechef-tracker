import axios from "axios";
import * as cheerio from "cheerio";

export async function getCodechefRank(username: string) {
  try {
    const url = `https://www.codechef.com/users/${username}`;
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Helper function to clean text
    const cleanText = (text: string) => text.replace(/\s+/g, " ").trim();

    // Extracting rank details
    const globalRank = cleanText($(".rating-ranks ul li").first().text().replace("Global Rank", ""));
    const countryRank = cleanText($(".rating-ranks ul li").last().text().replace("Country Rank", ""));
    const rating = cleanText($(".rating-number").first().text());
    const stars = cleanText($(".rating").first().text().split("\n")[0]);
    const highestRating = cleanText($(".rating-header:contains('Highest Rating') + strong").text());
    const fullySolved = cleanText($(".problems-solved .content").first().text());
    const partiallySolved = cleanText($(".problems-solved .content").last().text());

    // Extract recent contest details
    let lastContestName = "No recent contests";
    let contestSolvedProblems: string = "N/A";
    let submissionTimes: Record<string, string> = {}; // Store problem-wise time

    const lastContestElement = $(".contest-participated .content").first();

    if (lastContestElement.length > 0) {
      lastContestName = cleanText(lastContestElement.find("h5 span").text());
      contestSolvedProblems = cleanText(lastContestElement.find("p span").text().replace(/,\s+/g, ", "));

      // Fetch submission times
      const submissionUrl = `https://www.codechef.com/submissions?search=${username}`;
      const submissionResponse = await axios.get(submissionUrl);
      const submissionHtml = submissionResponse.data;
      const $sub = cheerio.load(submissionHtml);

      $sub("tr").each((_, row) => {
        const columns = $sub(row).find("td");
        if (columns.length > 0) {
          const problemName = cleanText($sub(columns[1]).text()); // Problem Name
          const submissionTime = cleanText($sub(columns[6]).text()); // Time Column

          if (contestSolvedProblems.includes(problemName)) {
            submissionTimes[problemName] = submissionTime;
          }
        }
      });
    }

    const result = {
      username,
      globalRank,
      countryRank,
      rating,
      stars,
      highestRating: highestRating || "N/A",
      fullySolved,
      partiallySolved: partiallySolved.replace(/\n/g, ", "),
      lastContest: {
        name: lastContestName,
        solvedProblems: contestSolvedProblems,
        submissionTimes,
        rank: "N/A",
      },
    };

    console.log("Scraped Data:", result);
    return result;
  } catch (error) {
    console.error(`Error fetching CodeChef details for ${username}:`, error);
    return null;
  }
}

// Example usage
getCodechefRank("rajkalyant").then(console.log);
