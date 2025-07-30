export async function getServerTime(key: string = "datetime", city: string = "manila"): Promise<any> {
  const apiKey = "KtWpQggJGLQSG4Rtx8/8HA==i5jnM26pjzeEssIQ";
  try {
    const res = await fetch(
      `https://api.api-ninjas.com/v1/worldtime?city=${encodeURIComponent(city)}`,
      {
        headers: {
          "X-Api-Key": apiKey,
        },
      }
    );
    if (!res.ok) throw new Error("Failed to fetch server time");
    const data = await res.json();
    return key ? data[key] : data;
  } catch (error: any) {
    const fallback: { [key: string]: any } = { 
      datetime: new Date().toISOString(), 
      error: error.message 
    };
    return key ? fallback[key] : fallback;
  }
}

//IF USING THIS, CONVERT FILE TO TS
// export async function getServerTime<T = any>(
//   key?: string,
//   timezone = "Asia/Manila"
// ): Promise<T> {
//   const res = await fetch(`https://timeapi.io/api/Time/current/zone?timeZone=${timezone}`);
//   if (!res.ok) throw new Error("Failed to fetch server time");
//   const data = await res.json();

//   if (key) {
//     return data[key];
//   }

  

//   return data;
// }