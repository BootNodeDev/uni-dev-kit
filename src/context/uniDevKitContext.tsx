import { UniDevKit } from "@/index";
import type { UniDevKitConfig, UniDevKitInstance } from "@/types";
import { createContext, useContext, useMemo } from "react";

interface UniDevKitContextType {
	unidevkit: UniDevKitInstance;
}

const uniDevKitContext = createContext<UniDevKitContextType | undefined>(
	undefined,
);

export function UniDevKitProvider({
	children,
	config,
}: { children: React.ReactNode; config: UniDevKitConfig }) {
	const instance = useMemo(() => {
		const kit = new UniDevKit(config);
		return kit.instance;
	}, [config]);

	return (
		<uniDevKitContext.Provider value={{ unidevkit: instance }}>
			{children}
		</uniDevKitContext.Provider>
	);
}

export function useUniDevKit() {
	const context = useContext(uniDevKitContext);
	if (!context)
		throw new Error("useUniDevKit must be used within a UniDevKitProvider");
	return context.unidevkit;
}
