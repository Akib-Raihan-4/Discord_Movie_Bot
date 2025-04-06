// index.js
require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`🎬 Logged in as ${client.user.tag}`);
});

const genreMap = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  sciencefiction: 878,
  tvmovie: 10770,
  thriller: 53,
  war: 10752,
  western: 37,
};

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim().toLowerCase();

  // Handle !recommend and !movie
  if (content === "!recommend" || content === "!movie") {
    try {
      const res = await axios.get(
        "https://api.themoviedb.org/3/trending/movie/day",
        {
          params: {
            api_key: process.env.TMDB_API_KEY,
          },
        }
      );

      const movies = res.data.results;
      const movie = movies[Math.floor(Math.random() * movies.length)];
      const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null;

      const embed = new EmbedBuilder()
        .setTitle(movie.title)
        .setDescription(movie.overview || "No description available.")
        .addFields({
          name: "⭐ Rating",
          value: `${movie.vote_average}`,
          inline: true,
        })
        .setColor(0xff5f5f);

      if (posterUrl) embed.setImage(posterUrl);

      message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      message.channel.send("❗ Oops! Couldn't fetch a movie right now.");
    }
  }

  // Handle !genre <genre>
  if (content.startsWith("!genre")) {
    const args = content.split(" ");
    const genreInput = args[1];

    if (!genreInput) {
      return message.channel.send(
        "❗ Please provide a genre. Example: `!genre comedy`"
      );
    }

    const genreKey = genreInput.toLowerCase().replace(/[^a-z]/g, "");
    const genreId = genreMap[genreKey];

    if (!genreId) {
      return message.channel.send(
        "❗ Genre not recognized. Try something like `action`, `comedy`, `horror`, `romance`, etc."
      );
    }

    try {
      const res = await axios.get(
        "https://api.themoviedb.org/3/discover/movie",
        {
          params: {
            api_key: process.env.TMDB_API_KEY,
            with_genres: genreId,
            sort_by: "popularity.desc",
          },
        }
      );

      const movies = res.data.results;
      const movie = movies[Math.floor(Math.random() * movies.length)];
      const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null;

      const embed = new EmbedBuilder()
        .setTitle(movie.title)
        .setDescription(movie.overview || "No description available.")
        .addFields(
          { name: "📚 Genre", value: genreInput, inline: true },
          { name: "⭐ Rating", value: `${movie.vote_average}`, inline: true }
        )
        .setColor(0x7f5fff);

      if (posterUrl) embed.setImage(posterUrl);

      message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      message.channel.send(
        "❗ Couldn't fetch movies from that genre right now."
      );
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
