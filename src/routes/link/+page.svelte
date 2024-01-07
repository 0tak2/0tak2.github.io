<svelte:head>
	<title>Links</title>
	<meta name="description" content="About this app" />
</svelte:head>

<script>
	const links = [
		{
			name: '깃허브',
			url: 'https://github.com/0tak2',
			icon: '',
		},
		{
			name: '블로그',
			url: 'https://archiveyoung.tistory.com/',
			icon: '',
		},
		{
			name: 'TIL (Today I Learned)',
			url: 'https://0tak2.github.io/T0L/',
			icon: '',
		},
		{
			name: '인스타그램',
			url: 'https://instagram.com/0tag2_98',
			icon: '',
		},
	];

	const goTo = (url) => {
		window.location = url;
	}
</script>

<div>
	<h1>임영택</h1>

	<p class="desc">
		상상을 컴파일하는<br />
		백엔드 엔지니어
	</p>

	<div class="link-container">
		{#each links as linkItem}
			<div class="link-item" on:click={() => { goTo(linkItem.url) }}>
				<div class="link-title">{linkItem.name}</div>
				<div class="link-url">{linkItem.url}</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.link-container {
		border: solid 1px black;
		margin: 1rem;
		background: rgba(255, 255, 255, 1.0);
	}

	.link-item {
		padding: 1rem;
		height: 120px;
		border-bottom: solid 0.5px black;
		display: flex;
		flex-direction: column;
		justify-content: center;
		cursor: pointer;
	}

	.link-item:hover {
		background-color: #E0E3DA;
	}

	.link-title {
		font-size: 1.3rem;
		font-weight: 500;
	}

	.link-url {
		font-size: 0.8rem;
		font-weight: 300;
	}

	h1 {
		font-weight: 600;
	}

	.desc {
		text-align: center;
	}
</style>