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

	<span class="badges">
		<a href="https://github.com/0tak2">
			<img src="https://img.shields.io/badge/-github-7C7877?style=flat&logo=GitHub&link=https://github.com/0tak2">
		</a>
		<a href="https://archiveyoung.tistory.com">
			<img src="https://img.shields.io/badge/-blog-7C7877?style=flat&logo=Tistory&link=https://archiveyoung.tistory.com">
		</a>
		<a href="https://instagram.com/0tag2_98">
			<img src="https://img.shields.io/badge/-instagram-7C7877?style=flat&logo=Instagram&link=https://instagram.com/0tag2_98">
		</a>
		<a href="https://0tak2.github.io/T0L">
			<img src="https://img.shields.io/badge/-Today%20I%20Learned-7C7877?style=flat&logo=gitbook&link=https://0tak2.github.io/T0L">
		</a>
	</span>
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
		font-weight: 600;
	}

	.badges {
		margin-top: 1.5rem;
	}
</style>
