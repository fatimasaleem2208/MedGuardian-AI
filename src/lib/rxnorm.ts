export type RxNormMedicine = {
  rxcui: string;
  name: string;
  synonym?: string;
  tty?: string;
};

export async function searchRxNormMedicines(
  query: string,
): Promise<RxNormMedicine[]> {
  const cleanQuery = query.trim();

  if (cleanQuery.length < 2) {
    return [];
  }

  const response = await fetch(
    `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(
      cleanQuery,
    )}`,
  );

  if (!response.ok) {
    throw new Error("Unable to search medicines.");
  }

  const data = await response.json();

  const groups = data?.drugGroup?.conceptGroup ?? [];

  const medicines: RxNormMedicine[] = [];

  for (const group of groups) {
    const concepts = group?.conceptProperties ?? [];

    for (const concept of concepts) {
      if (!concept?.rxcui || !concept?.name) continue;

      medicines.push({
        rxcui: concept.rxcui,
        name: concept.name,
        synonym: concept.synonym,
        tty: concept.tty,
      });
    }
  }

  // Remove duplicate RxCUIs.
  const unique = Array.from(
    new Map(medicines.map((medicine) => [medicine.rxcui, medicine])).values(),
  );

  return unique.slice(0, 100);
}