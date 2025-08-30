<!-- src/routes/+layout.svelte -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { user } from '$lib/userStore';
	import favicon from '$lib/assets/favicon.svg';
	import "../app.css";

	let { children } = $props();

	// This runs once when the app loads
	onMount(() => {
		// Get the initial user session in case the user was already logged in
		supabase.auth.getSession().then(({ data: { session } }) => {
			// Updated this line to be more explicit for TypeScript
			user.set(session ? session.user : null);
		});

		// Listen for any changes in authentication state (login, logout, etc.)
		const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
			// Updated this line as well for consistency
			user.set(session ? session.user : null);
		});

		// Clean up the listener when the component is destroyed
		return () => {
			authListener.subscription.unsubscribe();
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
