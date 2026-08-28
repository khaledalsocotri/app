import { Redirect } from "expo-router";
// The old tabbed content manager has been replaced by the dedicated dashboard
// sections (places, products, etc.). Keep this route pointing at the new one.
export default function ContentRedirect() { return <Redirect href="/admin/places" />; }
