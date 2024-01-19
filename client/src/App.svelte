<script lang="ts">
  // components
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from '/vite.svg'
  import VoteBox from './components/VoteBox.svelte'
  import ResultsChart from './components/ResultsChart.svelte';
    import { statusCheck } from './utils/utils';

  // constants
  const BASE_URL = "http://localhost:8000";
  
  // TODO: Update to state variables
  const pollId = "409a93781434995e89ec7707";
  const answers = ["Answer 1", "Answer 2"];
  const question = "What is better- cats or dogs?";
  const chartType = "bar";

  /**
   * Retrieves data for a chart given its id
   * @param chartId - the id of the chart to get data for
   */
  async function getChartData(pollId:String) {
    try {
      console.log(`${BASE_URL}/poll/${pollId}`);
      let res = await fetch(`${BASE_URL}/poll/${pollId}`);
      await statusCheck(res);
      console.log(res);

    } catch (err) {
      console.error(err);
      // alert(err);
    }
  }

  /**
   * Allows the user to vote on a poll
   * @param e - the event dispatched from the child which has
   * the voted value
   */
  async function makeVote(e:any) {
    try {
      let params = new FormData();
      params.append("vote", e.detail.vote)

      let res = await fetch(`${BASE_URL}/poll/${pollId}/vote`, {
        method: "POST",
        body: params
      });

      await statusCheck(res);
    } catch (err) {
      alert(err);
    }
  }

  getChartData(pollId)
</script>

<main>
  <h1>RealtimePolls</h1>
  <p>{question}</p>
  <ResultsChart
    data={answers}
  />
  <VoteBox
    answers={answers}
    on:vote={makeVote}
  />
  <!-- <div>
    <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
      <img src={viteLogo} class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>
  <h1>Vite + Svelte</h1>

  <div class="card">
    <Counter />
  </div>

  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer">SvelteKit</a>, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">
    Click on the Vite and Svelte logos to learn more
  </p> -->
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
