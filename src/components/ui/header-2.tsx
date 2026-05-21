'use client';
import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { BookOpen, Shield, FileText, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function Header() {
	const [open, setOpen] = React.useState(false);
	const [infoDropdownOpen, setInfoDropdownOpen] = React.useState(false);
	const scrolled = useScroll(10);

	const infoLinks = [
		{
			title: "About SNUGPT",
			description: "Learn more about our RAG architecture & vision",
			href: "/about",
			icon: BookOpen,
		},
		{
			title: "Privacy Policy",
			description: "University data compliance & encryption safety",
			href: "/privacy-policy",
			icon: Shield,
		},
		{
			title: "Apache License",
			description: "Open-source permissions and terms",
			href: "/license",
			icon: FileText,
		}
	];

	React.useEffect(() => {
		if (open) {
			// Disable scroll
			document.body.style.overflow = 'hidden';
		} else {
			// Re-enable scroll
			document.body.style.overflow = '';
		}

		// Cleanup when component unmounts (important for Next.js)
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn(
				'fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[75rem] border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out',
				{
					'bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg md:top-4 md:max-w-5xl md:shadow':
						scrolled && !open,
					'bg-background/90': open,
				},
			)}
		>
			<nav
				className={cn(
					'flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out',
					{
						'md:px-2': scrolled,
					},
				)}
			>
				<Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
					<div className="relative w-7 h-7 rounded-lg overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-300">
						<Image src="/avatar.svg" alt="SNUGPT" width={28} height={28} className="object-cover" />
					</div>
					<div className="flex flex-col -space-y-1">
						<span className="text-xs font-black tracking-tighter uppercase leading-none text-white">SNUGPT</span>
						<span className="text-[6px] font-bold text-indigo-400/60 tracking-[0.3em] uppercase leading-none">Delhi-NCR</span>
					</div>
				</Link>
				
				<div className="hidden items-center gap-2 md:flex">
					{/* Features Link */}
					<Link className={buttonVariants({ variant: 'ghost' })} href="/lander#features">
						Features
					</Link>

					{/* Updates Link */}
					<Link className={buttonVariants({ variant: 'ghost' })} href="/updates">
						Updates
					</Link>

					{/* Desktop Info Dropdown */}
					<div
						className="relative"
						onMouseEnter={() => setInfoDropdownOpen(true)}
						onMouseLeave={() => setInfoDropdownOpen(false)}
					>
						<button
							className={cn(
								buttonVariants({ variant: 'ghost' }),
								'inline-flex items-center gap-1 cursor-pointer'
							)}
						>
							Info
							<ChevronDown className={cn("w-3.5 h-3.5 text-white/50 transition-transform duration-300", {
								"rotate-180": infoDropdownOpen
							})} />
						</button>

						{infoDropdownOpen && (
							<div className="absolute top-[calc(100%-4px)] left-1/2 -translate-x-1/2 w-72 bg-black/95 border border-white/10 backdrop-blur-2xl rounded-2xl p-2.5 shadow-2xl z-50 flex flex-col gap-1 before:content-[''] before:absolute before:inset-x-0 before:-top-6 before:h-6">
								{infoLinks.map((item, i) => {
									const Icon = item.icon;
									return (
										<Link
											key={i}
											href={item.href}
											className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all group"
										>
											<div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/60 group-hover:scale-105 group-hover:border-amber-500/20 group-hover:text-amber-400 transition-all duration-300 shrink-0">
												<Icon className="w-4 h-4" />
											</div>
											<div className="flex flex-col items-start text-left">
												<span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors duration-300 font-jakarta">
													{item.title}
												</span>
												<span className="text-[10px] text-white/30 font-medium font-inter leading-tight mt-0.5">
													{item.description}
												</span>
											</div>
										</Link>
									);
								})}
							</div>
						)}
					</div>

					<Link href="/login" passHref legacyBehavior>
						<Button variant="outline">Sign In</Button>
					</Link>
					<Link href="/login" passHref legacyBehavior>
						<Button>Get Started</Button>
					</Link>
				</div>

				<Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden">
					<MenuToggleIcon open={open} className="size-5" duration={300} />
				</Button>
			</nav>

			<div
				className={cn(
					'bg-background/90 fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y md:hidden',
					open ? 'block' : 'hidden',
				)}
			>
				<div
					data-slot={open ? 'open' : 'closed'}
					className={cn(
						'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
						'flex h-full w-full flex-col justify-between gap-y-2 p-4',
					)}
				>
					<div className="flex flex-col gap-2">
						{/* Mobile Features */}
						<Link
							onClick={() => setOpen(false)}
							className={buttonVariants({
								variant: 'ghost',
								className: 'justify-start',
							})}
							href="/lander#features"
						>
							Features
						</Link>

						{/* Mobile Updates */}
						<Link
							onClick={() => setOpen(false)}
							className={buttonVariants({
								variant: 'ghost',
								className: 'justify-start',
							})}
							href="/updates"
						>
							Updates
						</Link>

						{/* Mobile Info links */}
						<div className="px-4 pt-4 pb-2 border-t border-white/5 mt-2">
							<span className="text-[10px] uppercase tracking-[0.3em] font-black text-white/20">University Info</span>
						</div>

						{infoLinks.map((item, i) => {
							const Icon = item.icon;
							return (
								<Link
									key={i}
									href={item.href}
									onClick={() => setOpen(false)}
									className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all group"
								>
									<div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/45 group-hover:text-amber-400 transition-colors shrink-0">
										<Icon className="w-4 h-4" />
									</div>
									<div className="flex flex-col items-start text-left">
										<span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">
											{item.title}
										</span>
										<span className="text-[9px] text-white/20 font-medium font-inter mt-0.5 leading-tight">
											{item.description}
										</span>
									</div>
								</Link>
							);
						})}
					</div>

					<div className="flex flex-col gap-2">
						<Link href="/login" passHref legacyBehavior>
							<Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
								Sign In
							</Button>
						</Link>
						<Link href="/login" passHref legacyBehavior>
							<Button className="w-full" onClick={() => setOpen(false)}>Get Started</Button>
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}

