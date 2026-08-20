/**
 * Sample Nepal administrative location data (Province -> District -> Municipality/Rural Municipality).
 * This is a representative subset, not the complete dataset. To extend, add more entries
 * following the same shape — the rest of the app only depends on the `Province` type below.
 */

export interface Municipality {
  name: string;
}

export interface District {
  name: string;
  municipalities: Municipality[];
}

export interface Province {
  name: string;
  districts: District[];
}

export const NEPAL_LOCATIONS: Province[] = [
  {
    name: "Koshi",
    districts: [
      {
        name: "Morang",
        municipalities: [
          { name: "Biratnagar Metropolitan City" },
          { name: "Sundarharaicha Municipality" },
          { name: "Rangeli Municipality" },
        ],
      },
      {
        name: "Sunsari",
        municipalities: [
          { name: "Itahari Sub-Metropolitan City" },
          { name: "Dharan Sub-Metropolitan City" },
          { name: "Barah Rural Municipality" },
        ],
      },
      {
        name: "Jhapa",
        municipalities: [
          { name: "Birtamod Municipality" },
          { name: "Damak Municipality" },
          { name: "Mechinagar Municipality" },
        ],
      },
    ],
  },
  {
    name: "Madhesh",
    districts: [
      {
        name: "Dhanusha",
        municipalities: [
          { name: "Janakpurdham Sub-Metropolitan City" },
          { name: "Mithila Municipality" },
          { name: "Bideha Municipality" },
        ],
      },
      {
        name: "Parsa",
        municipalities: [
          { name: "Birgunj Metropolitan City" },
          { name: "Pokhariya Municipality" },
        ],
      },
    ],
  },
  {
    name: "Bagmati",
    districts: [
      {
        name: "Kathmandu",
        municipalities: [
          { name: "Kathmandu Metropolitan City" },
          { name: "Kirtipur Municipality" },
          { name: "Tokha Municipality" },
        ],
      },
      {
        name: "Lalitpur",
        municipalities: [
          { name: "Lalitpur Metropolitan City" },
          { name: "Godawari Municipality" },
          { name: "Mahalaxmi Municipality" },
        ],
      },
      {
        name: "Bhaktapur",
        municipalities: [
          { name: "Bhaktapur Municipality" },
          { name: "Madhyapur Thimi Municipality" },
          { name: "Changunarayan Municipality" },
        ],
      },
      {
        name: "Chitwan",
        municipalities: [
          { name: "Bharatpur Metropolitan City" },
          { name: "Ratnanagar Municipality" },
          { name: "Kalika Rural Municipality" },
        ],
      },
    ],
  },
  {
    name: "Gandaki",
    districts: [
      {
        name: "Kaski",
        municipalities: [
          { name: "Pokhara Metropolitan City" },
          { name: "Annapurna Rural Municipality" },
          { name: "Machhapuchhre Rural Municipality" },
        ],
      },
      {
        name: "Tanahun",
        municipalities: [
          { name: "Byas Municipality" },
          { name: "Shuklagandaki Municipality" },
        ],
      },
    ],
  },
  {
    name: "Lumbini",
    districts: [
      {
        name: "Rupandehi",
        municipalities: [
          { name: "Butwal Sub-Metropolitan City" },
          { name: "Siddharthanagar Municipality" },
          { name: "Tilottama Municipality" },
        ],
      },
      {
        name: "Dang",
        municipalities: [
          { name: "Ghorahi Sub-Metropolitan City" },
          { name: "Tulsipur Sub-Metropolitan City" },
        ],
      },
    ],
  },
  {
    name: "Karnali",
    districts: [
      {
        name: "Surkhet",
        municipalities: [
          { name: "Birendranagar Municipality" },
          { name: "Bheriganga Municipality" },
        ],
      },
      {
        name: "Jumla",
        municipalities: [
          { name: "Chandannath Municipality" },
          { name: "Tatopani Rural Municipality" },
        ],
      },
    ],
  },
  {
    name: "Sudurpashchim",
    districts: [
      {
        name: "Kailali",
        municipalities: [
          { name: "Dhangadhi Sub-Metropolitan City" },
          { name: "Tikapur Municipality" },
          { name: "Ghodaghodi Municipality" },
        ],
      },
      {
        name: "Kanchanpur",
        municipalities: [
          { name: "Bhimdatta Municipality" },
          { name: "Belauri Municipality" },
        ],
      },
    ],
  },
];

export function getProvinceNames(): string[] {
  return NEPAL_LOCATIONS.map((p) => p.name);
}

export function getDistrictsForProvince(provinceName: string): string[] {
  const province = NEPAL_LOCATIONS.find((p) => p.name === provinceName);
  return province ? province.districts.map((d) => d.name) : [];
}

export function getMunicipalitiesForDistrict(
  provinceName: string,
  districtName: string
): string[] {
  const province = NEPAL_LOCATIONS.find((p) => p.name === provinceName);
  const district = province?.districts.find((d) => d.name === districtName);
  return district ? district.municipalities.map((m) => m.name) : [];
}
