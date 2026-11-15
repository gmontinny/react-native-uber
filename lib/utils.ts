import { Ride } from "@/types/type";

export const sortRides = (rides: Ride[]): Ride[] => {
  const result = rides.sort((a, b) => {
    const dateA = new Date(`${a.created_at}T${a.ride_time}`);
    const dateB = new Date(`${b.created_at}T${b.ride_time}`);
    return dateB.getTime() - dateA.getTime();
  });

  return result.reverse();
};

export function formatTime(minutes: number): string {
  const formattedMinutes = +minutes?.toFixed(0) || 0;

  if (formattedMinutes < 60) {
    return `${formattedMinutes} min`;
  } else {
    const hours = Math.floor(formattedMinutes / 60);
    const remainingMinutes = formattedMinutes % 60;
    return `${hours} h ${remainingMinutes} min`;
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatPaymentStatus(status: string): string {
  const labels: Record<string, string> = {
    paid: "Pago",
    pending: "Pendente",
    unpaid: "Não pago",
    failed: "Falhou",
    canceled: "Cancelado",
    cancelled: "Cancelado",
    refunded: "Reembolsado",
    processing: "Em processamento",
    succeeded: "Pago",
  };
  return labels[status] ?? "Status indisponível";
}
