<script>
	import Monaco from "./Monaco.svelte";

</script>

<svelte:head>
	<title>임영택</title>
	<meta name="description" content="백엔드 엔지니어 임영택" />
</svelte:head>

<section>
	<h1>
		임영택 Youngtaek Lim
	</h1>

	<h2>
		상상을 컴파일하는 <br />
		백엔드 엔지니어
	</h2>
</section>

<Monaco />

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
		height: 300px;
	}

	h1 {
		width: 100%;
	}
</style>
