import React, { useEffect, useState } from "react";
import { Select, SimpleGrid } from "@mantine/core";
import { getServerTime } from "../../utils/getServerTime";

interface DateSelectorProps {
  date: string;
  onDateChange: (newDate: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  date = "",
  onDateChange,
}) => {
  const [serverYear, setServerYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    getServerTime("year")
      .then(setServerYear)
      .catch(() => setServerYear(new Date().getFullYear()));
  }, []);

  const handleYearChange = (value: string | null) => {
    if (value) {
      const [year, month, day] = date.split("-");
      onDateChange(`${value}-${month || "01"}-${day || "01"}`);
    }
  };

  const handleMonthChange = (value: string | null) => {
    if (value) {
      const [year, month, day] = date.split("-");
      onDateChange(`${year || "2000"}-${value}-${day || "01"}`);
    }
  };

  const handleDayChange = (value: string | null) => {
    if (value) {
      const [year, month, day] = date.split("-");
      onDateChange(`${year || "2000"}-${month || "01"}-${value}`);
    }
  };

  return (
    <SimpleGrid cols={3}>
      <Select
        placeholder="Month"
        value={date.split("-")[1] || ""}
        onChange={handleMonthChange}
        data={[
          { value: "01", label: "January" },
          { value: "02", label: "February" },
          { value: "03", label: "March" },
          { value: "04", label: "April" },
          { value: "05", label: "May" },
          { value: "06", label: "June" },
          { value: "07", label: "July" },
          { value: "08", label: "August" },
          { value: "09", label: "September" },
          { value: "10", label: "October" },
          { value: "11", label: "November" },
          { value: "12", label: "December" },
        ]}
        required
      />
      <Select
        placeholder="Day"
        value={date.split("-")[2] || ""}
        onChange={handleDayChange}
        data={Array.from({ length: 31 }, (_, i) => ({
          value: String(i + 1).padStart(2, "0"),
          label: String(i + 1),
        }))}
        required
      />
      <Select
        placeholder="Year"
        value={date.split("-")[0] || ""}
        onChange={handleYearChange}
        data={Array.from({ length: 100 }, (_, i) => ({
          value: String(serverYear - i),
          label: String(serverYear - i),
        }))}
        required
      />
    </SimpleGrid>
  );
};

export default DateSelector;