'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function AuthPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleOAuthSignIn = async (provider: string) => {
		setIsLoading(provider);
		setErrorMessage(null);
		try {
			await signIn(provider, { callbackUrl: '/chat' });
		} catch (error) {
			console.error("Sign in error:", error);
			setErrorMessage(`Failed to sign in with ${provider}. Please try again.`);
			setIsLoading(null);
		}
	};

	const handleEmailSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim() || email.trim().length < 3) {
			setErrorMessage('Please enter a valid User ID or Email address.');
			return;
		}
		if (!password || password.length < 6) {
			setErrorMessage('Password must be at least 6 characters long.');
			return;
		}

		setIsLoading('email');
		setErrorMessage(null);
		try {
			const res = await signIn('credentials', {
				email: email.trim(),
				password: password,
				redirect: false,
				callbackUrl: '/chat',
			});
			if (res?.error) {
				setErrorMessage(res.error);
				setIsLoading(null);
			} else {
				window.location.href = '/chat';
			}
		} catch (error) {
			console.error("Email sign in error:", error);
			setErrorMessage('An unexpected error occurred. Please try again.');
			setIsLoading(null);
		}
	};

	return (
		<main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2 bg-[#050505] text-[#ededed]">
			{/* Left Branding Side (Desktop view only) */}
			<div className="bg-neutral-950/60 relative hidden h-full flex-col border-r border-white/5 p-10 lg:flex">
				<div className="from-[#050505] absolute inset-0 z-10 bg-gradient-to-t to-transparent pointer-events-none" />
				
				{/* SNUGPT Brand Logo/Title */}
				<div className="z-10 flex items-center gap-3">
					<div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 shadow-lg">
						<Image 
							src="/avatar.svg" 
							alt="SNUGPT Logo" 
							width={32} 
							height={32} 
							className="object-cover"
							priority
						/>
					</div>
					<div className="flex flex-col -space-y-1">
						<span className="text-lg font-black tracking-tighter uppercase leading-tight">SNUGPT</span>
						<span className="text-[6px] font-bold text-amber-500 tracking-[0.4em] uppercase">University Intel</span>
					</div>
				</div>

				{/* University Quote */}
				<div className="z-10 mt-auto max-w-md">
					<blockquote className="space-y-4">
						<p className="text-lg font-medium text-white/90 leading-relaxed font-jakarta">
							&ldquo;SnuGPT has saved me countless hours of digging through academic manuals, department guidelines, and campus handbooks. It is the ultimate digital companion for every Shiv Nadar University student.&rdquo;
						</p>
						<footer className="font-mono text-xs font-semibold text-amber-500 tracking-wide">
							— Shiv Nadar University Student
						</footer>
					</blockquote>
				</div>

				{/* Premium Floating Paths Background lines */}
				<div className="absolute inset-0">
					<FloatingPaths position={1} />
					<FloatingPaths position={-1} />
				</div>
			</div>

			{/* Right Interactive Login Form Side */}
			<div className="relative flex min-h-screen flex-col justify-center p-4">
				<div
					aria-hidden
					className="absolute inset-0 isolate contain-strict -z-10 opacity-60 pointer-events-none"
				>
					<div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(242,169,0,0.06)_0,rgba(255,255,255,0.02)_50%,transparent_80%)] absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full" />
					<div className="bg-[radial-gradient(50%_50%_at_50%_50%,rgba(242,169,0,0.04)_0,rgba(255,255,255,0.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 [translate:5%_-50%] rounded-full" />
					<div className="bg-[radial-gradient(50%_50%_at_50%_50%,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full" />
				</div>

				{/* Home Navigation button */}
				<Button variant="ghost" className="absolute top-7 left-5 text-white/50 hover:text-white" asChild>
					<a href="/">
						<ChevronLeft className='size-4 me-2' />
						Home
					</a>
				</Button>

				<div className="mx-auto space-y-6 sm:w-sm w-full max-w-md">
					{/* SNUGPT Brand Header (Mobile view only) */}
					<div className="flex items-center gap-3 lg:hidden">
						<div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 shadow-lg">
							<Image 
								src="/avatar.svg" 
								alt="SNUGPT Logo" 
								width={32} 
								height={32} 
								className="object-cover"
								priority
							/>
						</div>
						<div className="flex flex-col -space-y-1">
							<span className="text-lg font-black tracking-tighter uppercase leading-tight">SNUGPT</span>
							<span className="text-[6px] font-bold text-amber-500 tracking-[0.4em] uppercase">University Intel</span>
						</div>
					</div>

					<div className="flex flex-col space-y-1.5">
						<h1 className="font-jakarta text-2xl md:text-3xl font-black tracking-wide text-white">
							Sign In or Join Now!
						</h1>
						<p className="text-white/40 text-sm md:text-base font-inter">
							Sign in or create your SNUGPT account.
						</p>
					</div>

					{errorMessage && (
						<div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold">
							{errorMessage}
						</div>
					)}

					{/* OAuth login providers */}
					<div className="space-y-2">
						<Button 
							type="button" 
							size="lg" 
							variant="outline"
							className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-white font-semibold cursor-pointer active:scale-98 transition-all"
							disabled={isLoading !== null}
							onClick={() => handleOAuthSignIn('google')}
						>
							{isLoading === 'google' ? (
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent me-2" />
							) : (
								<GoogleIcon className='size-4 me-2 text-white' />
							)}
							Continue with Google
						</Button>
						
						<Button 
							type="button" 
							size="lg" 
							variant="outline"
							className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-white font-semibold cursor-pointer active:scale-98 transition-all"
							disabled={isLoading !== null}
							onClick={() => handleOAuthSignIn('github')}
						>
							{isLoading === 'github' ? (
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent me-2" />
							) : (
								<Github className='size-4 me-2 text-white' />
							)}
							Continue with GitHub
						</Button>
					</div>

					<AuthSeparator />

					{/* Email and Password Credentials sign-in form */}
					<form className="space-y-4" onSubmit={handleEmailSignIn}>
						<div className="space-y-1">
							<p className="text-white/40 text-start text-xs font-inter font-medium leading-normal">
								User ID or Email
							</p>
							<div className="relative h-max">
								<Input
									placeholder="e.g. rj910 or rj910@snu.edu.in"
									className="peer ps-9 bg-white/5 border-white/10 text-white placeholder-white/30 h-10 rounded-xl"
									type="text"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									disabled={isLoading !== null}
								/>
								<div className="text-white/30 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
									<AtSign className="size-4" aria-hidden="true" />
								</div>
							</div>
						</div>

						<div className="space-y-1">
							<p className="text-white/40 text-start text-xs font-inter font-medium leading-normal">
								Password
							</p>
							<div className="relative h-max">
								<Input
									placeholder="Min. 6 characters"
									className="peer ps-9 pe-10 bg-white/5 border-white/10 text-white placeholder-white/30 h-10 rounded-xl w-full"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									disabled={isLoading !== null}
								/>
								<div className="text-white/30 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
									<LockIcon className="size-4" aria-hidden="true" />
								</div>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-white/35 hover:text-white/70 transition-colors focus:outline-none cursor-pointer"
									disabled={isLoading !== null}
								>
									{showPassword ? (
										<EyeOffIcon className="size-4" />
									) : (
										<EyeIcon className="size-4" />
									)}
								</button>
							</div>
						</div>

						<p className="text-[10px] text-white/30 text-start leading-normal">
							First time here? Entering a new password will automatically register your account!
						</p>

						<Button 
							type="submit" 
							className="w-full bg-white hover:bg-white/95 text-black font-bold h-10 rounded-xl cursor-pointer active:scale-98 transition-all mt-2"
							disabled={isLoading !== null}
						>
							{isLoading === 'email' ? (
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent me-2" />
							) : null}
							<span>Continue with Password</span>
						</Button>
					</form>

					<p className="text-white/30 mt-8 text-xs font-inter leading-relaxed">
						By clicking continue, you agree to our{' '}
						<a
							href="/license"
							className="text-amber-500 hover:text-amber-400 underline underline-offset-4"
						>
							Terms of Service
						</a>{' '}
						and{' '}
						<a
							href="/privacy-policy"
							className="text-amber-500 hover:text-amber-400 underline underline-offset-4"
						>
							Privacy Policy
						</a>
						.
					</p>
				</div>
			</div>
		</main>
	);
}

function FloatingPaths({ position }: { position: number }) {
	const paths = Array.from({ length: 36 }, (_, i) => ({
		id: i,
		d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
			380 - i * 5 * position
		} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
			152 - i * 5 * position
		} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
			684 - i * 5 * position
		} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
		color: `rgba(242, 169, 0, ${0.1 + i * 0.03})`,
		width: 0.5 + i * 0.03,
	}));

	return (
		<div className="pointer-events-none absolute inset-0">
			<svg
				className="h-full w-full text-amber-500/30"
				viewBox="0 0 696 316"
				fill="none"
			>
				<title>Background Paths</title>
				{paths.map((path) => (
					<motion.path
						key={path.id}
						d={path.d}
						stroke="currentColor"
						strokeWidth={path.width}
						strokeOpacity={0.1 + path.id * 0.03}
						initial={{ pathLength: 0.3, opacity: 0.6 }}
						animate={{
							pathLength: 1,
							opacity: [0.3, 0.6, 0.3],
							pathOffset: [0, 1, 0],
						}}
						transition={{
							duration: 20 + Math.random() * 10,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'linear',
						}}
					/>
				))}
			</svg>
		</div>
	);
}

const GoogleIcon = (props: React.ComponentProps<'svg'>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		{...props}
	>
		<g>
			<path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669   C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62   c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401   c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
		</g>
	</svg>
);

const Github = (props: React.ComponentProps<'svg'>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		{...props}
	>
		<path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
	</svg>
);

const ChevronLeft = (props: React.ComponentProps<'svg'>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
		{...props}
	>
		<path d="m15 18-6-6 6-6" />
	</svg>
);

const AtSign = (props: React.ComponentProps<'svg'>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		{...props}
	>
		<circle cx="12" cy="12" r="4" />
		<path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
	</svg>
);

const AuthSeparator = () => {
	return (
		<div className="flex w-full items-center justify-center py-2">
			<div className="bg-white/10 h-px w-full" />
			<span className="text-white/20 px-3 text-xs font-mono font-bold">OR</span>
			<div className="bg-white/10 h-px w-full" />
		</div>
	);
};

const LockIcon = (props: React.ComponentProps<'svg'>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		{...props}
	>
		<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
		<path d="M7 11V7a5 5 0 0 1 10 0v4" />
	</svg>
);

const EyeIcon = (props: React.ComponentProps<'svg'>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		{...props}
	>
		<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
		<circle cx="12" cy="12" r="3" />
	</svg>
);

const EyeOffIcon = (props: React.ComponentProps<'svg'>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		{...props}
	>
		<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
		<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
		<path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
		<line x1="2" x2="22" y1="2" y2="22" />
	</svg>
);
