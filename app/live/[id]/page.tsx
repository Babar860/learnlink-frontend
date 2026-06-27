import { LiveClassRoom } from "../../components/LiveClassRoom";

export default function LiveClassPage({ params }: { params: { id: string } }) {
  return <LiveClassRoom classId={params.id} />;
}
