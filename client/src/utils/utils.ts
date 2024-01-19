export async function statusCheck(res: Response) {
  if (!res.ok) {
    throw new Error(await res.text())
  }

  return res
}