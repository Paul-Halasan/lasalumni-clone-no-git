import React, { useEffect, useState, useCallback } from "react";
import { Select, Group, Text } from "@mantine/core";
import debounce from "lodash.debounce";
import PropTypes from 'prop-types';

interface CurrentAddressProps {
  country: string;
  setCountry: (value: string) => void;
  region: string;
  setRegion: (value: string) => void;
  province: string;
  setProvince: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  clearErrorMessage: () => void;
}

const CustomLabel: React.FC<{ label: string }> = React.memo(({ label }) => (
  <Text c="dimmed" fw={700} size="sm">
    {label.replace("_", " ").toUpperCase()}
  </Text>
));

CustomLabel.propTypes = {
  label: PropTypes.string.isRequired,
};

const CurrentAddress: React.FC<CurrentAddressProps> = ({
  country,
  setCountry,
  region,
  setRegion,
  province,
  setProvince,
  city,
  setCity,
  clearErrorMessage,
}) => {
  const [countries, setCountries] = useState<
    { value: string; label: string; name: string }[]
  >([]);
  const [regions, setRegions] = useState<{ value: string; label: string }[]>(
    []
  );
  const [provinces, setProvinces] = useState<
    { value: string; label: string }[]
  >([]);
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);
  const [countryId, setCountryId] = useState<string>("");
  const [regionId, setRegionId] = useState<string>("");
  const [provinceId, setProvinceId] = useState<string>("");
  const [cityId, setCityId] = useState<string>("");

  const fetchCountries = useCallback(async () => {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all");
      const data = await response.json();
      const countryData = data.map((country: any) => ({
        value: country.cca2,
        label: country.name.common,
        name: country.name.common,
      }));
      setCountries(countryData);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  }, []);

  const fetchRegions = useCallback(
    debounce(async (countryName: string) => {
      try {
        const response = await fetch(
          `https://secure.geonames.org/searchJSON?q=${countryName}&featureCode=ADM1&username=gia.lasala`
        );
        const data = await response.json();
        if (data.geonames) {
          const regionData = data.geonames.map((region: any) => ({
            value: region.geonameId.toString(),
            label: region.name,
          }));
          setRegions(regionData);
        } else {
          setRegions([]);
        }
      } catch (error) {
        console.error("Error fetching regions:", error);
      }
    }, 300),
    []
  );

  const fetchProvinces = useCallback(
    debounce(async (regionId: string) => {
      try {
        const response = await fetch(
          `https://secure.geonames.org/childrenJSON?geonameId=${regionId}&username=gia.lasala`
        );
        const data = await response.json();
        if (data.geonames) {
          const provinceData = data.geonames.map((province: any) => ({
            value: province.geonameId.toString(),
            label: province.name,
          }));
          setProvinces(provinceData);
        } else {
          setProvinces([]);
        }
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    }, 300),
    []
  );

  const fetchCities = useCallback(
    debounce(async (provinceId: string) => {
      try {
        const response = await fetch(
          `https://secure.geonames.org/childrenJSON?geonameId=${provinceId}&username=gia.lasala`
        );
        const data = await response.json();
        if (data.geonames) {
          const cityData = data.geonames.map((city: any) => ({
            value: city.geonameId.toString(),
            label: city.name,
          }));
          setCities(cityData);
        } else {
          setCities([]);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  useEffect(() => {
    if (countryId) {
      const selectedCountry = countries.find((c) => c.value === countryId);
      if (selectedCountry) {
        fetchRegions(selectedCountry.name);
      }
    } else {
      setRegions([]);
      setProvinces([]);
      setCities([]);
    }
  }, [countryId, fetchRegions, countries]);

  useEffect(() => {
    if (regionId) {
      fetchProvinces(regionId);
    } else {
      setProvinces([]);
      setCities([]);
    }
  }, [regionId, fetchProvinces]);

  useEffect(() => {
    if (provinceId) {
      fetchCities(provinceId);
    } else {
      setCities([]);
    }
  }, [provinceId, fetchCities]);

  useEffect(() => {
    const selectedCountry = countries.find((c) => c.label === country);
    if (selectedCountry) {
      setCountryId(selectedCountry.value);
    }
  }, [country, countries]);

  useEffect(() => {
    const selectedRegion = regions.find((r) => r.label === region);
    if (selectedRegion) {
      setRegionId(selectedRegion.value);
    }
  }, [region, regions]);

  useEffect(() => {
    const selectedProvince = provinces.find((p) => p.label === province);
    if (selectedProvince) {
      setProvinceId(selectedProvince.value);
    }
  }, [province, provinces]);

  useEffect(() => {
    const selectedCity = cities.find((c) => c.label === city);
    if (selectedCity) {
      setCityId(selectedCity.value);
    }
  }, [city, cities]);

  const handleCountryChange = (value: string | null) => {
    const selectedCountry = countries.find((c) => c.value === value);
    if (selectedCountry) {
      setCountry(selectedCountry.label);
      setCountryId(selectedCountry.value);

      // Reset dependent dropdowns
      setRegion("");
      setRegionId("");
      setProvinces([]);
      setProvince("");
      setProvinceId("");
      setCities([]);
      setCity("");
      setCityId("");
    }
  };

  const handleRegionChange = (value: string | null) => {
    const selectedRegion = regions.find((r) => r.value === value);
    if (selectedRegion) {
      setRegion(selectedRegion.label);
      setRegionId(selectedRegion.value);

      // Reset provinces and cities
      setProvince("");
      setProvinceId("");
      setCities([]);
      setCity("");
      setCityId("");
    }
  };

  const handleProvinceChange = (value: string | null) => {
    const selectedProvince = provinces.find((p) => p.value === value);
    if (selectedProvince) {
      setProvince(selectedProvince.label);
      setProvinceId(selectedProvince.value);

      // Reset cities
      setCity("");
      setCityId("");
    }
  };

  const handleCityChange = (value: string | null) => {
    const selectedCity = cities.find((c) => c.value === value);
    if (selectedCity) {
      setCity(selectedCity.label);
      setCityId(selectedCity.value);
    }
  };

  return (
    <>
      <Group grow>
        <CustomLabel label="country" />
        <Select
          placeholder="Select a country"
          data={countries}
          value={countryId}
          onChange={handleCountryChange}
          mt="md"
          required
          searchable
        />
      </Group>

      <Group grow>
        <CustomLabel label="region" />
        <Select
          placeholder="Select a region"
          data={regions}
          value={regionId}
          onChange={handleRegionChange}
          disabled={!regions.length}
          mt="md"
          required
          searchable
        />
      </Group>

      <Group grow>
        <CustomLabel label="province" />
        <Select
          placeholder="Select a province"
          data={provinces}
          value={provinceId}
          onChange={handleProvinceChange}
          disabled={!provinces.length}
          mt="md"
          required
          searchable
        />
      </Group>

      <Group grow>
        <CustomLabel label="city" />
        <Select
          placeholder="Select a city"
          data={cities}
          value={cityId}
          onChange={handleCityChange}
          disabled={!cities.length}
          mt="md"
          required
          searchable
        />
      </Group>
    </>
  );
};

export default CurrentAddress;
