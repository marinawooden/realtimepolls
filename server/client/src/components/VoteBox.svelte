<script lang="ts">
  // props
  export let answers: String[]

  // packages
  import { createEventDispatcher } from 'svelte';

  // constants
  const dispatch = createEventDispatcher();

  let voteValue:String | undefined;

  function vote() {
    dispatch('vote', {
      vote: voteValue
    });
  }

</script>

<form on:submit|preventDefault={vote}>
  {#each answers as answer, i}
    <div class="answer">
      <input
        bind:group={voteValue}
        type="radio"
        id={`answer-${i}`}
        name={`answer-${i}`}
        value={answer}
      />
      <label for={`answer-${i}`}>{answer}</label>
    </div>
  {/each}
  <button disabled='{!voteValue}'>
    Vote!
  </button>
</form>

<style>
  .answer {
    display: flex;
  }
</style>
