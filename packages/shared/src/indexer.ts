/** Run a GraphQL query against the Ponder indexer (apps/api). */
export const queryIndexer = async (endpoint: string, query: string) => {
	const res = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({ query }),
	});
	const { data } = await res.json();

	return data;
};

interface AirstackCast {
	hash: string;
	castValue: { formattedValue: number };
}

/** Map Airstack cast values to the scores shown in the UI and used for payouts. */
export const formatCastScores = (casts: AirstackCast[]) =>
	casts.map((cast) => {
		const score =
			cast.castValue.formattedValue > 10
				? Math.ceil(cast.castValue.formattedValue)
				: cast.castValue.formattedValue.toFixed(2);

		return {
			hash: cast.hash,
			score,
		};
	});
