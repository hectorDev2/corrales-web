import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_HOME_SAVINGS_SETTINGS, type FooterSettings } from "@/lib/api/settings";

import { AdminHomeSavingsPage } from "./AdminHomeSavingsPage";

const { toast, updateHomeSavingsSettings, uploadProductImage } = vi.hoisted(() => ({
  toast: { error: vi.fn(), success: vi.fn() },
  updateHomeSavingsSettings: vi.fn().mockResolvedValue(undefined),
  uploadProductImage: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/lib/api/settings", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/settings")>()),
  updateHomeSavingsSettings,
}));

vi.mock("@/lib/api/products", () => ({ uploadProductImage }));

vi.mock("sonner", () => ({ toast }));

Object.defineProperty(URL, "createObjectURL", { value: vi.fn(() => "blob:preview") });
Object.defineProperty(URL, "revokeObjectURL", { value: vi.fn() });

const footer: FooterSettings = {
  aboutText: "",
  whatsapp: "",
  email: "",
  address: "",
  sections: [],
  social: { facebook: "", instagram: "", tiktok: "" },
};

describe("AdminHomeSavingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("edits the home heading and the four ordered category tiles", async () => {
    const user = userEvent.setup();
    render(<AdminHomeSavingsPage initial={DEFAULT_HOME_SAVINGS_SETTINGS} currentFooter={footer} />);

    await user.clear(screen.getByLabelText("Título de la sección"));
    await user.type(screen.getByLabelText("Título de la sección"), "Elegí tu favorito");
    await user.click(screen.getByRole("button", { name: "Mover Para Compartir hacia abajo" }));
    await user.click(screen.getByLabelText("Mostrar Para Compartir en el inicio"));
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(updateHomeSavingsSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Elegí tu favorito",
        tiles: expect.arrayContaining([
          expect.objectContaining({ label: "Para Compartir", sortOrder: 1, isActive: false }),
        ]),
      }),
      footer,
    );
  });

  it("uploads a valid image and synchronizes the URL input and preview", async () => {
    const user = userEvent.setup();
    const imageUrl = "https://demo.supabase.co/storage/v1/object/public/product-images/home.webp";
    uploadProductImage.mockResolvedValue(imageUrl);
    render(<AdminHomeSavingsPage initial={DEFAULT_HOME_SAVINGS_SETTINGS} currentFooter={footer} />);

    const file = new File(["image"], "home.webp", { type: "image/webp" });
    await user.upload(screen.getByLabelText("Subir imagen para Para Compartir"), file);

    expect(uploadProductImage).toHaveBeenCalledWith(file);
    await waitFor(() => {
      expect(screen.getAllByLabelText("URL de imagen")[0]).toHaveValue(imageUrl);
    });
    expect(screen.getByAltText("Vista previa de Para Compartir")).toHaveAttribute("src", imageUrl);
  });

  it("rejects an unsupported image before it reaches Supabase Storage", async () => {
    render(<AdminHomeSavingsPage initial={DEFAULT_HOME_SAVINGS_SETTINGS} currentFooter={footer} />);

    const file = new File(["gif"], "home.gif", { type: "image/gif" });
    fireEvent.change(screen.getByLabelText("Subir imagen para Para Compartir"), {
      target: { files: [file] },
    });

    expect(uploadProductImage).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Subí una imagen JPG, PNG o WebP.");
  });
});
