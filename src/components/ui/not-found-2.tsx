import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { HomeIcon, CompassIcon } from "lucide-react";

export function NotFound() {
	return (
		<div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background">
			<Empty className="border-none bg-transparent">
				<EmptyHeader>
					<EmptyTitle className="mask-b-from-20% mask-b-to-80% font-extrabold text-9xl bg-gradient-to-b from-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-md selection:bg-transparent">
						404
					</EmptyTitle>
					<EmptyDescription className="-mt-4 text-nowrap text-muted-foreground/90 font-medium">
						The page you're looking for might have been <br />
						moved or doesn't exist.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<div className="flex gap-3">
						<Button asChild className="cursor-pointer active:scale-95 transition-all">
							<Link href="/">
								<HomeIcon
								className="size-4 mr-2" data-icon="inline-start" />
								Go Home
							</Link>
						</Button>

						<Button asChild variant="outline" className="cursor-pointer active:scale-95 transition-all">
							<Link href="/about">
								<CompassIcon 
								className="size-4 mr-2" 
								data-icon="inline-start" />{" "}
								Explore About
							</Link>
						</Button>
					</div>
				</EmptyContent>
			</Empty>
		</div>
	);
}
