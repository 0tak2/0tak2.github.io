<script>
	import { page } from '$app/stores';
	import { base } from '$app/paths';
</script>

<header>
	<div class="corner">
	</div>

	<nav>
		<ul>
			<li aria-current={$page.url.pathname === `${base}/` ? 'page' : undefined}>
				<a href="{base}/">임영택</a>
			</li>
			<li aria-current={$page.url.pathname === `${base}/portfolio` ? 'page' : undefined}>
				<a href="{base}/portfolio">포트폴리오</a>
			</li>
		</ul>
	</nav>

	<div class="corner">
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		margin-top: 0.5rem;
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 1.0);
		border: 1px solid black;
	}

	ul {
		position: relative;
		padding: 0 1rem;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li[aria-current='page'] {
		text-decoration-line: underline;
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--color-theme-1);
	}
</style>
