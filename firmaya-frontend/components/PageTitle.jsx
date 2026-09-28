import Icon from "@/components/Icon";

export default function PageTitle({ icon, title }) {
  return (
    <div className="page-title">
      <span className="title-icon">
        <Icon name={icon} />
      </span>
      <h1>{title}</h1>
    </div>
  );
}
