import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OptionGroupsForm } from "./OptionGroupsForm";

const { getAdminOptionGroups, saveOptionGroups, uploadProductImage, toast } = vi.hoisted(() => ({
  getAdminOptionGroups: vi.fn(),
  saveOptionGroups: vi.fn(),
  uploadProductImage: vi.fn(),
  toast: { error: vi.fn() },
}));

vi.mock("@/lib/api/products", () => ({
  getAdminOptionGroups,
  saveOptionGroups,
  uploadProductImage,
}));

vi.mock("sonner", () => ({ toast }));

describe("OptionGroupsForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminOptionGroups.mockResolvedValue([
      {
        id: "extras",
        name: "Agrega un Extra",
        selection_type: "quantity",
        min_select: 0,
        max_select: null,
        is_required: false,
        sort_order: 0,
        options: [
          {
            id: "extra-pollo",
            name: "Extra Pollo",
            image_url: null,
            price_delta: 6,
            sort_order: 0,
          },
        ],
      },
    ]);
  });

  it("permite subir una imagen para cada opción desde el administrador", async () => {
    const user = userEvent.setup();
    const imageUrl =
      "https://demo.supabase.co/storage/v1/object/public/product-images/extra-pollo.webp";
    uploadProductImage.mockResolvedValue(imageUrl);

    render(<OptionGroupsForm productId="product-1" onSaved={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /Opciones de personalización/ }));

    const file = new File(["image"], "extra-pollo.webp", { type: "image/webp" });
    await user.upload(await screen.findByLabelText("Subir imagen para Extra Pollo"), file);

    expect(uploadProductImage).toHaveBeenCalledWith(file);
    await waitFor(() => {
      expect(screen.getByAltText("Extra Pollo")).toHaveAttribute("src", imageUrl);
    });

    await user.click(screen.getByRole("button", { name: "Guardar opciones" }));

    expect(saveOptionGroups).toHaveBeenCalledWith(
      "product-1",
      expect.arrayContaining([
        expect.objectContaining({
          updatedOptions: [expect.objectContaining({ image_url: imageUrl })],
        }),
      ]),
      [],
    );
  });
});
