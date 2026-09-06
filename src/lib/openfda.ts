export type OpenFDAMedicine = {
  brandName: string;
  genericName: string;
  manufacturer?: string;
  productType?: string;
};

export async function searchOpenFDAMedicines(
  query: string,
): Promise<OpenFDAMedicine[]> {
  const cleanQuery = query.trim();

  if (cleanQuery.length < 2) {
    return [];
  }

  const search = encodeURIComponent(
    `openfda.brand_name:"${cleanQuery}" OR openfda.generic_name:"${cleanQuery}"`
  );

  const response = await fetch(
    `https://api.fda.gov/drug/label.json?search=${search}&limit=20`
  );

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error("Unable to search openFDA.");
  }

  const data = await response.json();

  const medicines: OpenFDAMedicine[] = [];

  for (const item of data?.results ?? []) {
    const fda = item?.openfda;

    if (!fda) continue;

    const brandNames = fda.brand_name ?? [];
    const genericNames = fda.generic_name ?? [];
    const manufacturers = fda.manufacturer_name ?? [];
    const productTypes = fda.product_type ?? [];

    medicines.push({
      brandName: brandNames[0] ?? "Unknown brand",
      genericName: genericNames[0] ?? "Unknown generic",
      manufacturer: manufacturers[0],
      productType: productTypes[0],
    });
  }

  const unique = Array.from(
    new Map(
      medicines.map((medicine) => [
        `${medicine.brandName}-${medicine.genericName}`,
        medicine,
      ])
    ).values()
  );

  return unique.slice(0, 20);
}